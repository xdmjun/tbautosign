# tbautosign
github actions 贴吧自动签到 nodejs 版
1
## 用法

## 1.fork 项目

## 2.获取 BDUSS

网页中登录贴吧，然后打开『开发者工具』，找到 BDUSS  

```
Application->Storage->Cookies
```

## 3.将 BDUSS 添加到仓库的 Secrets 中

多用户按如下格式添加。  

```
BDUSS1&&BDUSS2
```

## 4.开启 actions

默认actions是处于禁止的状态，需要手动开启。

## 5.运行 actions

- 自己提交`push`  
- 每天早上十一点和下午九点将会进行签到  
