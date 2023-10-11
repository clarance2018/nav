# nav
 设置Git本地仓库的步骤:
1. 选择一个目录作为本地仓库,进入该目录下:
```
cd path/to/project-folder
```
2. 初始化本地仓库:
```
git init
```
这会在当前目录下创建一个隐藏的.git目录,用来跟踪版本信息。
3. 添加文件到版本控制:
```
git add file1 file2 
```
或者添加所有文件:
```
git add .
```
4. 提交文件到本地仓库: 
```
git commit -m "first commit"
```
5. 设置用户信息(可选):
```
git config user.name "Your Name"
git config user.email "email@example.com"
```
6. 检查状态:
```
git status
```
7. 查看历史记录:
``` 
git log
```
以上步骤就完成了本地仓库的初始化和文件提交。
还可以进一步:
- 关联远程仓库
- 推送文件到远程仓库
- 从远程仓库拉取更新
- 使用分支管理开发
这样就可以在本地对项目进行版本控制了。


删除Git本地和远程分支的步骤:

删除本地分支

查看当前所有本地分支:
``` 
git branch
``` 
删除本地分支:
``` 
git branch -d <branch name>
``` 
例如:
``` 
git branch -d feature-branch
``` 
强制删除本地分支(包含未合并的commit):
``` 
git branch -D <branch name>
``` 
删除远程分支

查看所有远程分支:
``` 
git branch -r
``` 
删除远程分支:
``` 
git push origin --delete <branch name> 
``` 
例如:
``` 
git push origin --delete feature-branch
``` 
强制删除远程分支:
``` 
git push origin :<branch name>
``` 
删除本地和远程同时进行
``` 
git branch -d <branch name> 
git push origin --delete <branch name>
``` 
删除分支后,如果分支代码还需要,可以使用git branch <new branch name> <branch name>命令重新建立分支。

这就是删除Git本地和远程分支的基本命令,希望对你有帮助!