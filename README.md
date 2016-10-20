# SC - exhibition

----

                                         |__
                                         |\/
                                         ---
                                         / | [
                                  !      | |||
                                _/|     _/|-++'
                            +  +--|    |--|--|_ |-
                         { /|__|  |/\__|  |--- |||__/
                        +---------------___[}-_===_.'____                 /\
                    ____`-' ||___-{]_| _[}-  |     |_[___\==--            \/   _
     __..._____--==/___]_|__|_____________________________[___\==--____,------' .7
    |                                                                样板业务代码/
     \_________________________________________________________________________|

>   这是阿里巴巴国际网站前端业务代码编写范例，约定了各业务线前端业务代码可遵循的建议性规范。

## 目录结构

任何业务代码仓库起码应该具有以下目录结构：

**基本代码均推荐直接复制该 project 内容再修改而成**

    + {project-name}/             # 应用名称，业务代码仓库根目录
        + {scene-name}/
        - {scene-name}/           # 按页面类型维度存放代码，eg: home/
            {entrance-name}.js    # 入口文件
            {entrance-name}.css   # 入口文件
            ...
        + {scene-name}/
        ...
        .editorconfig             # 代码格式配置
        .gitignore                # 过滤不需要提交到git的本地文件
        .npmignore                # 过滤不需要发布到线上的文件
        .sc-{project-name}.release# AONE2发布用发布类型判断文件，必须存在
        common.js                 # 自动生成的应用级公用JS
        common.css                # 自动生成的应用级公用CSS
        hashmap.js                # 所有文件的 hash 值信息，给 seajs 使用
        package.json              # 应用信息与依赖配置
        README.md                 # 应用文档

+ {project-name}

    业务代码名称使用小写字母，单词之间使用`-`分隔，例如`buyer-market`。

+ {scene-name}

    请按照场景维度分类存放业务代码，以保持良好的目录结构，例如`home/`、`detail/`。

+ .editorconfig

    源代码漂亮的程序员不一定是好程序员，但反过来就一定不是，因此请善用[EditorConfig](http://editorconfig.org/)。

+ .gitignore

    把本地开发过程中产生的临时文件过滤掉，这样提到到git仓库的代码也会清爽很多，以体现组件作者的专业水准。最起码应该过滤掉以下东西，根据实际情况可酌情添加。

+ .npmignore

    可以过滤掉只用于开发环境的目录和文件，例如`examples/`、`tests/`，这样发布上线的代码可以更少，发布速度可以变快，线上服务器的磁盘也比较好受，而且可以避免不小心把不该上线的文件发上线。

+ common.js/common.css

    该文件承载该 project 全页面通用的 js/css 代码，需要配合 package.json 里的 **teleport** 属性使用

+ hashmap.js

    用于记录当前应用文件的 hash 值，需要同步加载到页面中给 seajs 调用，有必要时也可以在里边引用一些页面初始化时需要 **同步执行** 的东西，比如响应式框架。

    **这个文件需要以同步 script 的方式手动引入到 vm 中！**

        <script type="text/javascript" src="#link("sc-xxxx/hashmap.js")"></script>

+ package.json

    业务代码对应的 *前端应用名称* 和 *前端组件依赖信息* 在此配置。

        {
            "name": "{group-name}-{project-name}",
            "private": true,
            "dependencies": {
                "@alife/alpha-jquery": "1.0.x",
                "@alife/alpha-apollo": "2.0.x"
            },
            "devDependencies": {},
            "scripts": {},
            "teleport": {
                "build": {
                    "common": {
                        "js": "common.js",
                        "css": "common.css"
                    }
                },
                "main": [
                    "detail/detail.+(js|css)"
                    "home/home.+(js|css)"
                ]
            }
        }

    + name

        按 `{group-name}-{project-name}` 的方式命名，例如该事例就是 `sc-sample`

    + private

        加上这个字段可避免不小心把业务代码发布到`npm/tnpm`上。

    + dependencies

        在此申明业务代码直接依赖到的组件名称和版本号。为了避免不必要的组件版本升级，版本号需要精确到`x`和`y`位，例如`1.1.x`，这样在保证业务代码的稳定性的同时，也让组件bug修复一类的需求变得简单。

    + devDependencies

        用于配置开发环境和代码构建所依赖的NodeJS模块名称和版本。

    + scripts

        用于自由配置开发环境和代码构建所需要的脚本。

    + teleport

        用于配置静态构建的策略。具体请参考 [teleport](http://gitlab.alibaba-inc.com/icbu-node/teleport/tree/master#README)

## 源代码规范

业务代码的源代码规范与[组件源代码规范](http://gitlab.alibaba-inc.com/alpha/sample)无差异。

## 开发环境搭建

请参考 [just server](http://docs.alibaba.net/docs/just/server.html)

## 开发及相关配置

请参考 [just build](http://docs.alibaba.net/docs/just/build.html)

## 宙斯盾部署

~~呵呵~~

## 意见反馈

如果你在使用过程中有任何意见和反馈，请联系[连沁](https://work.alibaba-inc.com/work/u/36919)。
