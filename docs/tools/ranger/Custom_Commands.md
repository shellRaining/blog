---
title: ranger 自定义指令
tag:
  - ranger
date: 2024-02-05
openCategory: false
---

# 目标

在这里你可以学到如何自定义 ranger 的指令。

将你想要的指令添加到 `~/.config/ranger/commands.py` 中。注意：你总是需要在 `commands.py` 的顶部导入 `Command` 类：

```python
from ranger.api.commands import Command
```

你可以通过运行 `ranger --copy-config=commands` 来获取一个合适的 `commands.py`。

为了和一些外部工具进行集成，你可以查看[[Integration with other programs|这个章节]]。

# Custom commands

## mkcd (mkdir + cd)

```python
class mkcd(Command):
    """
    :mkcd <dirname>

    Creates a directory with the name <dirname> and enters it.
    """

    def execute(self):
        from os.path import join, expanduser, lexists
        from os import makedirs
        import re

        dirname = join(self.fm.thisdir.path, expanduser(self.rest(1)))
        if not lexists(dirname):
            makedirs(dirname)

            match = re.search('^/|^~[^/]*/', dirname)
            if match:
                self.fm.cd(match.group(0))
                dirname = dirname[match.end(0):]

            for m in re.finditer('[^/]+', dirname):
                s = m.group(0)
                if s == '..' or (s.startswith('.') and not self.fm.settings['show_hidden']):
                    self.fm.cd(s)
                else:
                    ## We force ranger to load content before calling `scout`.
                    self.fm.thisdir.load_content(schedule=False)
                    self.fm.execute_console('scout -ae ^{}$'.format(s))
        else:
            self.fm.notify("file/directory exists!", bad=True)
```

## Toggle flat

```python
class toggle_flat(Command):
    """
    :toggle_flat

    Flattens or unflattens the directory view.
    """

    def execute(self):
        if self.fm.thisdir.flat == 0:
            self.fm.thisdir.unload()
            self.fm.thisdir.flat = -1
            self.fm.thisdir.load_content()
        else:
            self.fm.thisdir.unload()
            self.fm.thisdir.flat = 0
            self.fm.thisdir.load_content()
```

## Upload files

This command may be used for quickly uploading a file to a server via scp.

```python
class up(Command):
    def execute(self):
        if self.arg(1):
            scpcmd = ["scp", "-r"]
            scpcmd.extend([f.realpath for f in self.fm.thistab.get_selection()])
            scpcmd.append(self.arg(1))
            self.fm.execute_command(scpcmd)
            self.fm.notify("Uploaded!")


    def tab(self, tabnum):
        import os.path
        try:
            import paramiko
        except ImportError:
            """paramiko not installed"""
            return

        try:
            with open(os.path.expanduser("~/.ssh/config")) as file:
                paraconf = paramiko.SSHConfig()
                paraconf.parse(file)
        except IOError:
            """cant open ssh config"""
            return

        hosts = sorted(list(paraconf.get_hostnames()))
        # remove any wildcard host settings since they're not real servers
        hosts.remove("*")
        query = self.arg(1) or ''
        matching_hosts = []
        for host in hosts:
            if host.startswith(query):
                matching_hosts.append(host)
        return (self.start(1) + host + ":" for host in matching_hosts)
```

## Navigate remote hosts via `sshfs`

Use `sshfs_mount` to mount a host filesystem and `sshfs_umount` to unmount. The design is stolen from `nnn` file manager.

```python

import subprocess
import os

def show_error_in_console(msg, fm):
    fm.notify(msg, bad=True)

def navigate_path(fm, selected):
    if not selected:
        return

    selected = os.path.abspath(selected)
    if os.path.isdir(selected):
        fm.cd(selected)
    elif os.path.isfile(selected):
        fm.select_file(selected)
    else:
        show_error_in_console(f"Neither directory nor file: {selected}", fm)
        return

def execute(cmd, input=None):
    stdin = None
    if input:
        stdin = subprocess.PIPE

    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, stdin=stdin, text=True)
    stdout, stderr = proc.communicate(input=input)

    if proc.returncode != 0:
        raise Exception(f"Bad process exit code: {proc.returncode}, stdout={stdout}, stderr={stderr}")

    return stdout, stderr

import re
import curses

import collections
URL = collections.namedtuple("URL", ["user", "hostname", "path"])

def parse_url(url):
    if len(t := url.split(sep="@", maxsplit=1)) > 1:
        user = t[0]
        rest = t[1]
    else:
        user = None
        rest = t[0]
    if len(t := rest.rsplit(sep=":", maxsplit=1)) > 1:
        hostname = t[0]
        path = t[1]
    else:
        hostname = t[0]
        path = None

    return URL(user=user, hostname=hostname, path=path)

def url2str(u :URL):
    res = u.hostname
    if u.user:
        res = f"{u.user}@{res}"
    path = u.path
    if path is None:
        path = ""

    return f"{res}:{path}"

def search_mount_path(mount_path):
    stdout, _ = execute(["mount"])
    return re.search(re.escape(mount_path)+r"\b", stdout)

def hostname2mount_path(hostname):
    mount_path = os.path.expanduser(f"~/.config/ranger/mounts/{hostname}")

    # check whether it is already mounted
    if search_mount_path(mount_path):
        raise Exception(f"Already mounted: {mount_path}")

    os.makedirs(mount_path, exist_ok=True)
    return mount_path

class sshfs_mount(Command):
    def execute(self):
        url = self.arg(1)
        u = parse_url(url)

        mount_path = hostname2mount_path(u.hostname)
        cmd = ["sshfs", url2str(u), mount_path]

        execute(cmd)

        # before navigating we should load it otherwise we see
        # "not accessible"
        d = self.fm.get_directory(mount_path)
        d.load()

        navigate_path(self.fm, mount_path)

    # options:
    # - None
    # - string: just one complete without iterating
    # - list, tuple, generator: to iterate options around
    def tab(self, tabnum):
        u = parse_url(self.rest(1))

        def path_options():
            lst = []
            for path in ["", "/"]:
                lst.append(self.start(1) + url2str(u._replace(path=path)))

            return lst

        # autocomplete hostname
        if u.path is None:
            hostname = select_with_fzf(["fzf", "-q", u.hostname], compose_hostname_list(), self.fm)
            #hostname = "ilya-thinkpad"

            # after suspend/init we should manually show the cursor
            # the same way console.open() does
            try:
                curses.curs_set(1)
            except curses.error:
                pass

            if not hostname:
                return None

            u = u._replace(hostname=hostname)
            return path_options()

        # autocomplete path
        return path_options()

def umount(mount_path):
    prefix = os.path.expanduser(f"~/.config/ranger/mounts/")
    if not mount_path.startswith(prefix):
        raise Exception(f"May umount only inside: {prefix}")

    if not search_mount_path(mount_path):
        raise Exception(f"Not mounted: {mount_path}")

    cmd = ["diskutil", "unmount", "force", mount_path]
    execute(cmd)

    os.rmdir(mount_path)

class sshfs_umount(Command):
    def execute(self):
        tab = self.fm.tabs[self.fm.current_tab]
        mount_path = tab.thisfile.path
        umount(mount_path)

def compose_hostname_list():
    # list of possible hostnames
    # stolen from fzf, https://github.com/junegunn/fzf/blob/master/shell/completion.bash
    stdout, _ = execute(["bash"], input='''
command cat <(
    command tail -n +1 ~/.ssh/config ~/.ssh/config.d/* /etc/ssh/ssh_config 2> /dev/null | command grep -i '^\s*host\(name\)\? ' | awk '{for (i = 2; i <= NF; i++) print $1 " " $i}' | command grep -v '[*?]') \
        <(command grep -oE '^[[a-z0-9.,:-]+' ~/.ssh/known_hosts | tr ',' '\n' | tr -d '[' | awk '{ print $1 " " $1 }') \
        <(command grep -v '^\s*\(#\|$\)' /etc/hosts | command grep -Fv '0.0.0.0') |
        awk '{if (length($2) > 0) {print $2}}' | sort -u
''')
    return stdout

```

## Search & navigation

### Visit frequently used directories

#### fasd

This command uses [fasd](https://github.com/clvv/fasd) to jump to a frequently visited directory with a given substring of its path.

```python
class fasd(Command):
    """
    :fasd

    Jump to directory using fasd
    """
    def execute(self):
        args = self.rest(1).split()
        if args:
            directories = self._get_directories(*args)
            if directories:
                self.fm.cd(directories[0])
            else:
                self.fm.notify("No results from fasd", bad=True)

    def tab(self, tabnum):
        start, current = self.start(1), self.rest(1)
        for path in self._get_directories(*current.split()):
            yield start + path

    @staticmethod
    def _get_directories(*args):
        import subprocess
        output = subprocess.check_output(["fasd", "-dl"] + list(args), universal_newlines=True)
        dirs = output.strip().split("\n")
        dirs.sort(reverse=True)  # Listed in ascending frecency
        return dirs
```

#### fasd_dir

Pull a list of fasd history, present and narrow the directories with fzf,  change directory on selection.  

```python
class fasd_dir(Command):
    def execute(self):
        import subprocess
        import os.path
        fzf = self.fm.execute_command("fasd -dl | grep -iv cache | fzf 2>/dev/tty", universal_newlines=True, stdout=subprocess.PIPE)
        stdout, stderr = fzf.communicate()
        if fzf.returncode == 0:
            fzf_file = os.path.abspath(stdout.rstrip('\n'))
            print(fzf_file)
            if os.path.isdir(fzf_file):
                self.fm.cd(fzf_file)
            else:
                self.fm.select_file(fzf_file)
```

See also [Integration with other programs](https://github.com/ranger/ranger/wiki/Integration-with-other-programs#fasd) for logging opened files to fasd.

#### autojump

There's also a [plugin](https://github.com/fdw/ranger-autojump) to integrate [autojump](https://github.com/wting/autojump). (See also [Ranger plugins](https://github.com/ranger/ranger/wiki/Plugins#autojump-integration-for-ranger))

#### z

[Plugin](https://github.com/ask1234560/ranger-zjumper) to integrate [z](https://github.com/rupa/z). (See also [Ranger plugins](https://github.com/ranger/ranger/wiki/Plugins))

#### z.lua

See [plugin page](https://github.com/skywind3000/z.lua/wiki/FAQ#how-to-integrate-zlua-to-ranger-)

#### zoxide

The [ranger-zoxide](https://github.com/jchook/ranger-zoxide) plugin adds a `:z` command to Ranger, allowing you to `cd` anywhere within ranger using just a few keystrokes.

This is made possible by [zoxide](https://github.com/ajeetdsouza/zoxide), a smarter `cd` command that supports all major shells.

### fzf integration

```python
class fzf_select(Command):
    """
    :fzf_select
    Find a file using fzf.
    With a prefix argument to select only directories.

    See: https://github.com/junegunn/fzf
    """

    def execute(self):
        import subprocess
        import os
        from ranger.ext.get_executables import get_executables

        if 'fzf' not in get_executables():
            self.fm.notify('Could not find fzf in the PATH.', bad=True)
            return

        fd = None
        if 'fdfind' in get_executables():
            fd = 'fdfind'
        elif 'fd' in get_executables():
            fd = 'fd'

        if fd is not None:
            hidden = ('--hidden' if self.fm.settings.show_hidden else '')
            exclude = "--no-ignore-vcs --exclude '.git' --exclude '*.py[co]' --exclude '__pycache__'"
            only_directories = ('--type directory' if self.quantifier else '')
            fzf_default_command = '{} --follow {} {} {} --color=always'.format(
                fd, hidden, exclude, only_directories
            )
        else:
            hidden = ('-false' if self.fm.settings.show_hidden else r"-path '*/\.*' -prune")
            exclude = r"\( -name '\.git' -o -name '*.py[co]' -o -fstype 'dev' -o -fstype 'proc' \) -prune"
            only_directories = ('-type d' if self.quantifier else '')
            fzf_default_command = 'find -L . -mindepth 1 {} -o {} -o {} -print | cut -b3-'.format(
                hidden, exclude, only_directories
            )

        env = os.environ.copy()
        env['FZF_DEFAULT_COMMAND'] = fzf_default_command
        env['FZF_DEFAULT_OPTS'] = '--height=40% --layout=reverse --ansi --preview="{}"'.format('''
            (
                batcat --color=always {} ||
                bat --color=always {} ||
                cat {} ||
                tree -ahpCL 3 -I '.git' -I '*.py[co]' -I '__pycache__' {}
            ) 2>/dev/null | head -n 100
        ''')

        fzf = self.fm.execute_command('fzf --no-multi', env=env,
                                      universal_newlines=True, stdout=subprocess.PIPE)
        stdout, _ = fzf.communicate()
        if fzf.returncode == 0:
            selected = os.path.abspath(stdout.strip())
            if os.path.isdir(selected):
                self.fm.cd(selected)
            else:
                self.fm.select_file(selected)
```

Now, simply bind this function to a key: `map <A-f> fzf_select`

### fzf filter and mark

```python
class fzf_mark(Command):
    """
    `:fzf_mark` refer from `:fzf_select`  (But Just in `Current directory and Not Recursion`)
        so just `find` is enough instead of `fdfind`)

    `:fzf_mark` can One/Multi/All Selected & Marked files of current dir that filterd by `fzf extended-search mode` 
        fzf extended-search mode: https://github.com/junegunn/fzf#search-syntax
        eg:    py    'py    .py    ^he    py$    !py    !^py
    In addition:
        there is a delay in using `get_executables` (So I didn't use it)
        so there is no compatible alias.
        but find is builtin command, so you just consider your `fzf` name
    Usage
        :fzf_mark
        
        shortcut in fzf_mark:
            <CTRL-a>      : select all 
            <CTRL-e>      : deselect all 
            <TAB>         : multiple select
            <SHIFT+TAB>   : reverse multiple select
            ...           : and some remap <Alt-key> for movement
    """

    def execute(self):
        # from pathlib import Path  # Py3.4+
        import os
        import subprocess

        fzf_name = "fzf" 

        hidden = ('-false' if self.fm.settings.show_hidden else r"-path '*/\.*' -prune")
        exclude = r"\( -name '\.git' -o -iname '\.*py[co]' -o -fstype 'dev' -o -fstype 'proc' \) -prune"
        only_directories = ('-type d' if self.quantifier else '')
        fzf_default_command = 'find -L . -mindepth 1 -type d -prune {} -o {} -o {} -print | cut -b3-'.format(
            hidden, exclude, only_directories
        )

        env = os.environ.copy()
        env['FZF_DEFAULT_COMMAND'] = fzf_default_command

        # you can remap and config your fzf (and your can still use ctrl+n / ctrl+p ...) + preview
        env['FZF_DEFAULT_OPTS'] = '\
        --multi \
        --reverse \
        --bind ctrl-a:select-all,ctrl-e:deselect-all,alt-n:down,alt-p:up,alt-o:backward-delete-char,alt-h:beginning-of-line,alt-l:end-of-line,alt-j:backward-char,alt-k:forward-char,alt-b:backward-word,alt-f:forward-word \
        --height 95% \
        --layout reverse \
        --border \
        --preview "cat {}  | head -n 100"'
        # if use bat instead of cat, you need install it
        # --preview "bat --style=numbers --color=always --line-range :500 {}"'

        fzf = self.fm.execute_command(fzf_name, env=env, universal_newlines=True, stdout=subprocess.PIPE)
        stdout, _ = fzf.communicate()

        if fzf.returncode == 0:
            filename_list = stdout.strip().split()
            for filename in filename_list:
                # Python3.4+
                # self.fm.select_file( str(Path(filename).resolve()) )
                self.fm.select_file( os.path.abspath(filename) )
                self.fm.mark_files(all=False,toggle=True)
```

Now, simply bind this function to a key: `map xxx fzf_mark` in your `rc.conf`

### Search with fd

[fd](https://github.com/sharkdp/fd) is a great replacement for the venerable `find`.
Put the following code in your `~/.config/ranger/commands.py`, if you don't have one you can get one by running `ranger --copy-config=commands`.
Note that fd returns its results according to your locale's collating order, this is somewhat annoying if your order in ranger differs (which it probably does because `natural`'s the default).

```python
from collections import deque

class fd_search(Command):
    """
    :fd_search [-d<depth>] <query>
    Executes "fd -d<depth> <query>" in the current directory and focuses the
    first match. <depth> defaults to 1, i.e. only the contents of the current
    directory.

    See https://github.com/sharkdp/fd
    """

    SEARCH_RESULTS = deque()

    def execute(self):
        import re
        import subprocess
        from ranger.ext.get_executables import get_executables

        self.SEARCH_RESULTS.clear()

        if 'fdfind' in get_executables():
            fd = 'fdfind'
        elif 'fd' in get_executables():
            fd = 'fd'
        else:
            self.fm.notify("Couldn't find fd in the PATH.", bad=True)
            return

        if self.arg(1):
            if self.arg(1)[:2] == '-d':
                depth = self.arg(1)
                target = self.rest(2)
            else:
                depth = '-d1'
                target = self.rest(1)
        else:
            self.fm.notify(":fd_search needs a query.", bad=True)
            return

        hidden = ('--hidden' if self.fm.settings.show_hidden else '')
        exclude = "--no-ignore-vcs --exclude '.git' --exclude '*.py[co]' --exclude '__pycache__'"
        command = '{} --follow {} {} {} --print0 {}'.format(
            fd, depth, hidden, exclude, target
        )
        fd = self.fm.execute_command(command, universal_newlines=True, stdout=subprocess.PIPE)
        stdout, _ = fd.communicate()

        if fd.returncode == 0:
            results = filter(None, stdout.split('\0'))
            if not self.fm.settings.show_hidden and self.fm.settings.hidden_filter:
                hidden_filter = re.compile(self.fm.settings.hidden_filter)
                results = filter(lambda res: not hidden_filter.search(os.path.basename(res)), results)
            results = map(lambda res: os.path.abspath(os.path.join(self.fm.thisdir.path, res)), results)
            self.SEARCH_RESULTS.extend(sorted(results, key=str.lower))
            if len(self.SEARCH_RESULTS) > 0:
                self.fm.notify('Found {} result{}.'.format(len(self.SEARCH_RESULTS),
                                                           ('s' if len(self.SEARCH_RESULTS) > 1 else '')))
                self.fm.select_file(self.SEARCH_RESULTS[0])
            else:
                self.fm.notify('No results found.')

class fd_next(Command):
    """
    :fd_next
    Selects the next match from the last :fd_search.
    """

    def execute(self):
        if len(fd_search.SEARCH_RESULTS) > 1:
            fd_search.SEARCH_RESULTS.rotate(-1)  # rotate left
            self.fm.select_file(fd_search.SEARCH_RESULTS[0])
        elif len(fd_search.SEARCH_RESULTS) == 1:
            self.fm.select_file(fd_search.SEARCH_RESULTS[0])

class fd_prev(Command):
    """
    :fd_prev
    Selects the next match from the last :fd_search.
    """

    def execute(self):
        if len(fd_search.SEARCH_RESULTS) > 1:
            fd_search.SEARCH_RESULTS.rotate(1)  # rotate right
            self.fm.select_file(fd_search.SEARCH_RESULTS[0])
        elif len(fd_search.SEARCH_RESULTS) == 1:
            self.fm.select_file(fd_search.SEARCH_RESULTS[0])
```

For convenience you can map these in your `~/.config/ranger/rc.conf`, get one with `ranger --copy-config=rc`.

For example:

```
map <alt>/ console fd_search -d5%space # Setting the depth to a different default, omit -d if you're fine with -d1
map <alt>n fd_next
map <alt>p fd_prev
```

### ripgrep-all + fzf integration

```python
class fzf_rga_documents_search(Command):
    """
    :fzf_rga_search_documents
    Search in PDFs, E-Books and Office documents in current directory.
    Allowed extensions: .epub, .odt, .docx, .fb2, .ipynb, .pdf.

    Usage: fzf_rga_search_documents <search string>
    """
    def execute(self):
        if self.arg(1):
            search_string = self.rest(1)
        else:
            self.fm.notify("Usage: fzf_rga_search_documents <search string>", bad=True)
            return

        import subprocess
        import os.path
        from ranger.container.file import File
        command="rga '%s' . --rga-adapters=pandoc,poppler | fzf +m | awk -F':' '{print $1}'" % search_string
        fzf = self.fm.execute_command(command, universal_newlines=True, stdout=subprocess.PIPE)
        stdout, stderr = fzf.communicate()
        if fzf.returncode == 0:
            fzf_file = os.path.abspath(stdout.rstrip('\n'))
            self.fm.execute_file(File(fzf_file))
```

### the_silver_searcher (Ag) integration [Not production ready]
Use Ag to search files and display results in ranger's pager

```python
class ag(Command):
    """:ag 'regex'
    Looks for a string in all marked paths or current dir
    """
    editor = os.getenv('EDITOR') or 'vim'
    acmd = 'ag --smart-case --group --color --hidden'  # --search-zip
    qarg = re.compile(r"""^(".*"|'.*')$""")
    patterns = []
    # THINK:USE: set_clipboard on each direct ':ag' search? So I could find in vim easily

    def _sel(self):
        d = self.fm.thisdir
        if d.marked_items:
            return [f.relative_path for f in d.marked_items]
        # WARN: permanently hidden files like .* are searched anyways
        #   << BUG: files skipped in .agignore are grep'ed being added on cmdline
        if d.temporary_filter and d.files_all and (len(d.files_all) != len(d.files)):
            return [f.relative_path for f in d.files]
        return []

    def _arg(self, i=1):
        if self.rest(i):
            ag.patterns.append(self.rest(i))
        return ag.patterns[-1] if ag.patterns else ''

    def _quot(self, patt):
        return patt if ag.qarg.match(patt) else shell_quote(patt)

    def _bare(self, patt):
        return patt[1:-1] if ag.qarg.match(patt) else patt

    def _aug_vim(self, iarg, comm='Ag'):
        if self.arg(iarg) == '-Q':
            self.shift()
            comm = 'sil AgSet def.e.literal 1|' + comm
        # patt = self._quot(self._arg(iarg))
        patt = self._arg(iarg)  # No need to quote in new ag.vim
        # FIXME:(add support)  'AgPaths' + self._sel()
        cmd = ' '.join([comm, patt])
        cmdl = [ag.editor, '-c', cmd, '-c', 'only']
        return (cmdl, '')

    def _aug_sh(self, iarg, flags=[]):
        cmdl = ag.acmd.split() + flags
        if iarg == 1:
            import shlex
            cmdl += shlex.split(self.rest(iarg))
        else:
            # NOTE: only allowed switches
            opt = self.arg(iarg)
            while opt in ['-Q', '-w']:
                self.shift()
                cmdl.append(opt)
                opt = self.arg(iarg)
            # TODO: save -Q/-w into ag.patterns =NEED rewrite plugin to join _aug*()
            patt = self._bare(self._arg(iarg))  # THINK? use shlex.split() also/instead
            cmdl.append(patt)
        if '-g' not in flags:
            cmdl += self._sel()
        return (cmdl, '-p')

    def _choose(self):
        if self.arg(1) == '-v':
            return self._aug_vim(2, 'Ag')
        elif self.arg(1) == '-g':
            return self._aug_vim(2, 'sil AgView grp|Ag')
        elif self.arg(1) == '-l':
            return self._aug_sh(2, ['--files-with-matches', '--count'])
        elif self.arg(1) == '-p':  # paths
            return self._aug_sh(2, ['-g'])
        elif self.arg(1) == '-f':
            return self._aug_sh(2)
        elif self.arg(1) == '-r':
            return self._aug_sh(2, ['--files-with-matches'])
        else:
            return self._aug_sh(1)

    def _catch(self, cmd):
        from subprocess import check_output, CalledProcessError
        try:
            out = check_output(cmd)
        except CalledProcessError:
            return None
        else:
            return out[:-1].decode('utf-8').splitlines()

    # DEV
    # NOTE: regex becomes very big for big dirs
    # BAD: flat ignores 'filter' for nested dirs
    def _filter(self, lst, thisdir):
        # filter /^rel_dir/ on lst
        # get leftmost path elements
        # make regex '^' + '|'.join(re.escape(nm)) + '$'
        thisdir.temporary_filter = re.compile(file_with_matches)
        thisdir.refilter()

        for f in thisdir.files_all:
            if f.is_directory:
                # DEV: each time filter-out one level of files from lst
                self._filter(lst, f)

    def execute(self):
        cmd, flags = self._choose()
        # self.fm.notify(cmd)
        # TODO:ENH: cmd may be [..] -- no need to shell_escape
        if self.arg(1) != '-r':
            self.fm.execute_command(cmd, flags=flags)
        else:
            self._filter(self._catch(cmd))

    def tab(self):
        # BAD:(:ag <prev_patt>) when input alias ':agv' and then <Tab>
        #   <= EXPL: aliases expanded before parsing cmdline
        cmd = self.arg(0)
        flg = self.arg(1)
        if flg[0] == '-' and flg[1] in 'flvgprw':
            cmd += ' ' + flg
        return ['{} {}'.format(cmd, p) for p in reversed(ag.patterns)]
```

NOTE: You may need to add the following line to your commands.py:

```python
import re
```

### OSX - Reveal selected files in Finder

The following command is useful if you need to select files and drag-and-drop them. For example, as an attachment to gmail message composer. Simply select the files, and run the command:

```python
class show_files_in_finder(Command):
    """
    :show_files_in_finder

    Present selected files in finder
    """

    def execute(self):
        import subprocess
        files = ",".join(['"{0}" as POSIX file'.format(file.path) for file in self.fm.thistab.get_selection()])
        reveal_script = "tell application \"Finder\" to reveal {{{0}}}".format(files)
        activate_script = "tell application \"Finder\" to set frontmost to true"
        script = "osascript -e '{0}' -e '{1}'".format(reveal_script, activate_script)
        self.fm.notify(script)
        subprocess.check_output(["osascript", "-e", reveal_script, "-e", activate_script])
```

or

```python
class show_files_in_finder(Command):
    """
    :show_files_in_finder

    Present selected files in finder
    """

    def execute(self):
        self.fm.run('open .', flags='f')

```

### [Skim](https://github.com/lotabout/skim) Integration

```python
class sk_select(Command):
    def execute(self):
        import subprocess
        from ranger.ext.get_executables import get_executables

        if 'sk' not in get_executables():
            self.fm.notify('Could not find skim', bad=True)
            return

        sk = self.fm.execute_command('sk ',universal_newlines=True, stdout=subprocess.PIPE)
        stdout, _ = sk.communicate()
        if sk.returncode == 0:
            selected = os.path.abspath(stdout.strip())
            if os.path.isdir(selected):
                self.fm.cd(selected)
            else:
                self.fm.select_file(selected)
```

Invoke it as ```:sk_select``` from ranger or bind it to a key as ``` map <C-f> sk_select ``` in rc.conf

### [broot](https://github.com/Canop/broot) integration

```python
import subprocess
import os

from ranger.api.commands import Command
from ranger.ext.get_executables import get_executables

def show_error_in_console(msg, fm):
    fm.notify(msg, bad=True)

def navigate_path(fm, selected):
    if not selected:
        return

    selected = os.path.abspath(selected)
    if os.path.isdir(selected):
        fm.cd(selected)
    elif os.path.isfile(selected):
        fm.select_file(selected)
    else:
        show_error_in_console(f"Neither directory nor file: {selected}", fm)
        return

def run_and_cd(cmd, fm):
    proc = fm.execute_command(cmd, text=True, stdout=subprocess.PIPE)
    stdout, _ = proc.communicate()
    if proc.returncode != 0:
        show_error_in_console(f"Bad process exit code: {proc.returncode}", fm)
        return

    navigate_path(fm, stdout.strip())

class broot_select(Command):
    def execute(self):
        if "broot" not in get_executables():
            show_error_in_console("Could not find broot", self.fm)
            return

        run_and_cd("broot", self.fm)

```

Invoke it as :broot_select from ranger or bind it to a key as `map <a-s> broot_select` in rc.conf.
After selecting a result file in broot use these keys to get back and navigate it in ranger:
```
<space>pp<enter>
``` 

broot search files by content
```
c/<search term>: search dir and subdirs
cr/<search term>: regex search dir and subdirs
<ctrl><right arrow>: preview file
<space>e<enter>: edit file
<esc>: clear search
```

### Navigating directories from ranger history

Going deep inside, wanna return to some directory you navigated before?
The requirement: [fzf](https://github.com/junegunn/fzf)

```python

import subprocess
import os

from ranger.api.commands import Command
from ranger.ext.get_executables import get_executables

def show_error_in_console(msg, fm):
    fm.notify(msg, bad=True)

def navigate_path(fm, selected):
    if not selected:
        return

    selected = os.path.abspath(selected)
    if os.path.isdir(selected):
        fm.cd(selected)
    elif os.path.isfile(selected):
        fm.select_file(selected)
    else:
        show_error_in_console(f"Neither directory nor file: {selected}", fm)
        return

def select_with_fzf(fzf_cmd, input, fm):
    fm.ui.suspend()
    try:
        # stderr is used to open to attach to /dev/tty
        proc = subprocess.Popen(fzf_cmd, stdout=subprocess.PIPE, stdin=subprocess.PIPE, text=True)
        stdout, _ = proc.communicate(input=input)

        # ESC gives 130
        if proc.returncode not in [0, 130]:
            raise Exception(f"Bad process exit code: {proc.returncode}, stdout={stdout}")
    finally:
        fm.ui.initialize()
    return stdout.strip()

class dir_history_navigate(Command):
    def execute(self):
        lst = []
        for d in reversed(self.fm.tabs[self.fm.current_tab].history.history):
            lst.append(d.path)

        fm = self.fm
        selected = select_with_fzf(["fzf"], "\n".join(lst), fm)

        navigate_path(fm, selected)
```

How to invoke: `:dir_history_navigate<enter>` or even `:dir<tab><enter>`.

### Search `home` directory with `fzf`

The following snippet searches your `home` directory for files and directories with fzf.

```python
class fzf_locate(Command):
    """
    :fzf_locate
    Find a file using fzf.
    With a prefix argument select only directories.
    See: https://github.com/junegunn/fzf
    """
    def execute(self):
        import subprocess
        if self.quantifier:
            command="locate home | fzf -e -i"
        else:
            command="locate home | fzf -e -i"
        fzf = self.fm.execute_command(command, stdout=subprocess.PIPE)
        stdout, stderr = fzf.communicate()
        if fzf.returncode == 0:
            fzf_file = os.path.abspath(stdout.decode('utf-8').rstrip('\n'))
            if os.path.isdir(fzf_file):
                self.fm.cd(fzf_file)
            else:
                self.fm.select_file(fzf_file)
```

To use it, add a keybinding of your liking to `rc.conf` like below:

```
map <C-g> fzf_locate
```

Credit: [ranger_file_locate_fzf.md](https://github.com/gotbletu/shownotes/blob/master/ranger_file_locate_fzf.md)

### Search file content in current directory recursively with `fzf` and open target with (neo)vim

```python
class fzf_content_open(Command):
    """
    :fzf_content_open
    Pre-requisites: fzf, rg, bat, awk, vim or neovim
    Using `rg` to search file content recursively in current directory.
    Filtering with `fzf` and preview with `bat`.
    Pressing `Enter` on target will open at line in (neo)vim.
    """

    def execute(self):
        import subprocess
        import os
        from ranger.ext.get_executables import get_executables

        if 'rg' in get_executables():
            rg = 'rg'
        else:
            self.fm.notify("Couldn't find rg in the PATH.", bad=True)
            return

        if 'fzf' in get_executables():
            fzf = 'fzf'
        else:
            self.fm.notify("Couldn't find fzf in the PATH.", bad=True)
            return

        if 'bat' in get_executables():
            bat = 'bat'
        else:
            self.fm.notify("Couldn't find bat in the PATH.", bad=True)
            return

        editor = None
        if 'nvim' in get_executables():
            editor = 'nvim'
        elif 'vim' in get_executables():
            editor = 'vim'

        if rg is not None and fzf is not None and bat is not None and editor is not None:
            # we should not recursively search through all file content from home directory
            if (self.fm.thisdir.path == self.fm.home_path):
                self.fm.notify("Searching from home directory is not allowed", bad=True)
                return
            fzf = self.fm.execute_command(
                'rg --line-number "${1:-.}" | fzf --delimiter \':\' \
                    --preview \'bat --color=always --highlight-line {2} {1}\' \
                    | awk -F \':\' \'{print "+"$2" "$1}\'',
                universal_newlines=True,stdout=subprocess.PIPE)

            stdout, _ = fzf.communicate()
            if fzf.returncode == 0:
                if len(stdout) < 2:
                    return

                selected_line = stdout.split()[0]
                full_path = stdout.split()[1].strip()

                file_fullpath = os.path.abspath(full_path)
                file_basename = os.path.basename(full_path)

                if os.path.isdir(file_fullpath):
                    self.fm.cd(file_fullpath)
                else:
                    self.fm.select_file(file_fullpath)

                self.fm.execute_command(editor + " " + selected_line + " " + file_basename)
```

## Tags

### [tmsu](https://tmsu.org/) integration

```python
class tmsu_tag(Command):
    """:tmsu_tag

    Tags the current file with tmsu
    """

    def execute(self):
        cf = self.fm.thisfile

        self.fm.run("tmsu tag \"{0}\" {1}".format(cf.basename, self.rest(1)))
```

## Copy file content

### Copy the content of image file and text file with xclip

```python
import os
import subprocess
from ranger.api.commands import Command
from ranger.container.file import File
from ranger.ext.get_executables import get_executables


class YankContent(Command):
    """
    Copy the content of image file and text file with xclip
    """

    def execute(self):
        if 'xclip' not in get_executables():
            self.fm.notify('xclip is not found.', bad=True)
            return

        arg = self.rest(1)
        if arg:
            if not os.path.isfile(arg):
                self.fm.notify('{} is not a file.'.format(arg))
                return
            file = File(arg)
        else:
            file = self.fm.thisfile
            if not file.is_file:
                self.fm.notify('{} is not a file.'.format(file.relative_path))
                return

        relative_path = file.relative_path
        cmd = ['xclip', '-selection', 'clipboard']
        if not file.is_binary():
            with open(file.path, 'rb') as fd:
                subprocess.check_call(cmd, stdin=fd)
        elif file.image:
            cmd += ['-t', file.mimetype, file.path]
            subprocess.check_call(cmd)
            self.fm.notify('Content of {} is copied to x clipboard'.format(relative_path))
        else:
            self.fm.notify('{} is not an image file or a text file.'.format(relative_path))

    def tab(self, tabnum):
        return self._tab_directory_content()
```

### Copy the content of an image file or a text file with wl-clipboard

```python
import os
import subprocess
from ranger.api.commands import Command
from ranger.container.file import File
from ranger.ext.get_executables import get_executables
class YankContentWl(Command):
    def execute(self):
        if "wl-copy" not in get_executables():
            self.fm.notify("wl-clipboard is not found.", bad=True)
            return

        arg = self.rest(1)
        if arg:
            if not os.path.isfile(arg):
                self.fm.notify("{} is not a file".format(arg))
                return
            file = File(arg)
        else:
            file = self.fm.thisfile
            if not file.is_file:
                self.fm.notify("{} is not a file".format(file.relative_path))
                return
        if file.is_binary or file.image:
            subprocess.check_call("wl-copy" + " < " + file.path, shell=True)
        else:
            self.fm.notify("{} is not an image file or a text file".format(file.relative_path))
```

## Ranger On WSL
🚀[ranger-wsl](https://github.com/linusic/ranger-wsl): configuration,scripts and custom commands of Ranger in the WSL environment

