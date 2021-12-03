为Spring Boot项目添加dorado支持。

```
<dependency>
  <groupId>org.xobo.dorado</groupId>
  <artifactId>dorado-spring-boot-starter</artifactId>
  <version>0.0.1-SNAPSHOT</version>
</dependency>

<repositories>
  <repository>
    <id>ossrh-snapshots</id>
    <url>https://oss.sonatype.org/content/repositories/snapshots</url>
  </repository>
</repositories>
```

dorado 会拦截如下路径的请求: *.d, *.c, *.dpkg, /dorado/* 。

原`dorado-home`目录打入jar包，如果没有定制需求，Spring Boot项目可以不添加该目录。如果有定制需求可以复制源码中的`dorado-home`目录到项目的`/src/main/resources/`再自行修改。

### 配置变化
基本所有dorado配置，均可直接配置入`application.properties`，除了`core.runMode`和`view.skin`。

#### core.runMode
默认值为debug, 该属性值为debug时，每次打开view都会重新加载xml适合开发时使用。如果要部署到生产需要置空或改成其他任意值。
由于该属性的加载时机过早，Spring 还没有完成对属性文件的加载。如果要调整改参数可以通过一下两种方式:
1. 需要通过添加JVM启动参数`d7.runMode`来修改。。 
```Java
java -Dd7.runMode= -jar demo.jar
```
#### view.skin
该属性可以指定dorado皮肤。dorado中由于直接使用了自身的`Configure`,所以在Spring Boot配置里需要添加`dorado.`前缀。
`dorado.view.skin`

2. 复制源码中`dorado-home`目录到`/src/main/resources/`目录，然后修改`configure.properties`文件里的`core.runMode`配置的值。


### 路径变化

默认会根据`@SpringBootApplication`所在位置作为基础目录,并设置`model.root`和`view.root`属性。

> model.root=classpath*:{base path}/**
> view.root=classpath:{base path}

如果项目结构为
```
turbo-demo
  src/main/java
    org.xobo.turbodorado.demo
      TruboDemoApplication.java
      Hello.view.xml
```
访问org.xobo.turbodorado.demo.Hello.view.xml，dorado默认为 /org.xobo.turbodorado.demo.Hello.d, 现在默认为 /Hello.d。

同时会搜索org.xobo.turbodorado.demo包下的所有的`*.model.xml`。

如果要恢复原始配置，在`application.properties`内添加:

```properties
view.root=classpath:
model.root=classpath*:models
```

### dorado el 表达式
默认可以通过`${configure["xxx"]}`在页面加载配置文件内属性值。由于属性文件加载机制的变化，增加新的el上下文`envs` 对应着Spring的Environment实例.
`${envs["xxx"]}` 等价于 environment.getProperty("xxx");