---
title: 白嫖claude 3个月！
tag:
  - tech_blog
date: 2024-07-28
---

## 白嫖 Claude~

1. 注册 GCP（Vertex AI） 账号

   需求：一个谷歌账号，一个干净的代理

   前往 [https://cloud.google.com/vertex-ai](https://cloud.google.com/vertex-ai) 注册一个 GCP 账号，注册成功后会赠送 150 刀，绑卡后增加到 300 刀，三个月有效期

2. 启用 Vertex AI API

   前往 [https://console.cloud.google.com/marketplace/product/google/aiplatform.googleapis.com](https://console.cloud.google.com/marketplace/product/google/aiplatform.googleapis.com)，点击蓝色的按钮启用 Vertex AI API

3. 使用 Claude models

   前往 [https://console.cloud.google.com/vertex-ai/model-garden](https://console.cloud.google.com/vertex-ai/model-garden)，这个链接实际上就是左侧边栏 tools 里面的模型库，进去以后可以看到一个搜索框，直接输入 Claude 就能看到冒出来了四个 Claude 模型，点一个你最喜欢的即可（我选的 3.5 sonnet），如果你也想选这个模型，请直接点击[这里](https://console.cloud.google.com/vertex-ai/publishers/anthropic/model-garden/claude-3-5-sonnet)。

   进去后点击启用，他会让你填写一个表，随意胡诌即可，然后一路点击下一步，会出现 `已成功购买 Claude 3 xxx` 的悬浮窗，表示成功，之后的事情就和这个网页无关了。

4. 创建服务账号

   前往 [https://console.cloud.google.com/projectselector2/iam-admin/serviceaccounts/create](https://console.cloud.google.com/projectselector2/iam-admin/serviceaccounts/create)

   点击近期项目中的 My First Project，会出现一个表单，表单分为三部分 `服务账号详情`，`向此服务账号授予对项目的访问权限 (可选)`，`向用户授予访问此服务账号的权限 (可选)`，都是可以随意填写的，填写完后点击完成，进入一个新页面。

   新页面会看到我们刚才创建的服务账号，点击最右侧的三个点（操作），然后点击管理秘钥，再依次点击添加秘钥，创建新秘钥，秘钥类型选择 JSON，点击创建，这一套操作后浏览器会下载一个 JSON 文件，留作后续使用。也请注意不要泄露该文件内的信息。

5. cloudflare worker搭建

   前往 [https://www.cloudflare.com/zh-cn/](https://www.cloudflare.com/zh-cn/)，登录后点击左侧导航栏的 `workers and pages`，再点击子项`概述`，点击中心面板内的蓝色按钮`创建`，进入新页面后再依次点击 `创建 Workers`，`部署`，在这之后会出现部署成功的提示，我们点击编辑代码。

   我们会看到新页面有一个代码编辑器（很像是 vscode），打开一个新页面，前往 [https://github.com/cg-dot/vertexai-cf-workers/blob/main/worker.js](https://github.com/cg-dot/vertexai-cf-workers/blob/main/worker.js)，复制里面的所有代码，粘贴到刚才 cloudflare 的编辑器中，然后在编辑器第一行添加如下代码：

   ```JavaScript
   // 注释：这里的信息需要我们用第四步下载的 JSON 文件来填充
   const CLIENT_EMAIL = ""; // 对应与 JSON client_email
   const PRIVATE_KEY = ""; // private_key
   const PROJECT = "" // project_id
   const API_KEY = "" // 这个需要我们自己填写，随便想一个吧！
   ```

   在这之后，找到 `MODELS` 变量，注释掉所有的模型，仅保留我们第三步中启用的模型，我的注释效果如下：

   ```JavaScript
   const MODELS = {
     // "claude-3-opus": {
     //     vertexName: "claude-3-opus@20240229",
     //     region: "us-east5",
     // },
     // "claude-3-sonnet": {
     //     vertexName: "claude-3-sonnet@20240229",
     //     region: "us-central1",
     // },
     // "claude-3-haiku": {
     //     vertexName: "claude-3-haiku@20240307",
     //     region: "us-central1",
     // },
     // "claude-3-5-sonnet": {
     //     vertexName: "claude-3-5-sonnet@20240620",
     //     region: "us-east5",
     // },
     // "claude-3-opus-20240229": {
     //     vertexName: "claude-3-opus@20240229",
     //     region: "us-east5",
     // },
     // "claude-3-sonnet-20240229": {
     //     vertexName: "claude-3-sonnet@20240229",
     //     region: "us-central1",
     // },
     // "claude-3-haiku-20240307": {
     //     vertexName: "claude-3-haiku@20240307",
     //     region: "us-central1",
     // },
     "claude-3-5-sonnet-20240620": {
         vertexName: "claude-3-5-sonnet@20240620",
         region: "us-east5",
     },
   };
   ```

   至此，我们代码已经更改完成，点击右上角蓝色的`部署`按钮。

6. 测试

   使用 postman 或者 curl 来发送模拟请求，这里给出 curl 的请求代码：

   ```bash
   curl --location '替换本段文字为代码编辑器右上角中的URL/v1/messages' \
   --header 'Content-Type: application/json' \
   --header 'x-api-key: 替换为第五步中的API_KEY' \
   --data '{
     "model": "替换成第五步中没有注释的模型代号",
     "messages": [
         {
             "role": "user",
             "content": "what is your name"
         }
     ],
     "stream": false,
     "max_tokens": 512
   }'
   ```

   发送请求，如果看到类似的返回值就表示成功

   ```JSON
   {
       "id": "xxx",
       "type": "message",
       "role": "assistant",
       "model": "xxx",
       "content": [
           {
               "type": "text",
               "text": "My name is Claude. It's nice to meet you!"
           }
       ],
       "stop_reason": "end_turn",
       "stop_sequence": null,
       "usage": {
           "input_tokens": 11,
           "output_tokens": 15
       }
   }
   ```

7. 使用 chatbox 来更方便访问

   前往 [https://chatboxai.app/zh](https://chatboxai.app/zh)，模型提供方选择 Claude，API 域名设置为 cloudflare 代码编辑器右上角中的 URL，注意不要带 `/v1/messages` 后缀，模型选择我们没有注释的那个模型代号，此时就可以正常对话了！
