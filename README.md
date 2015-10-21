#BlxClass

##简介
一个JavaScript面对对象的库，让你在JavaScript用上靠谱的面对对象特性。

##使用
将本项目中的 ```dist/Class.js``` 复制到你的项目下

###1. 在nodejs中使用

```JavaScript
    var Class = require('path/to/Class.js');
    var ClassA = Class('ClassA', Object);
```

###2. 在浏览器中使用

```Html
    <script src="path/to/Class.js"></script>
    var ClassA = Class('ClassA', Object);
```

##API

###1.  Class( class\_name, parent\_class)
Class函数接受两个参数返回一个新类，第一个参数是新类的命名，第二个参数是继承自哪个类。如果并没有继承自别的类，那么直接写Object就好了。

```JavaScript
    var ClassA = Class('ClassA', Object);
    var ClassB = Class('ClassB', ClassA);
```

###2. name
类的名字

```JavaScript
    var ClassA = Class('ClassA', Object);
    console.log(ClassA.name) // => ClassA
    var ClassB = Class('some name', ClassA);
    console.log(ClassB.name) // => some name
```

###3. parent
类的父类

```JavaScript
    var ClassA = Class('ClassA', Object);
    ClassA.parent === Object; // => true
    var ClassB = Class('ClassB', ClassA);
    ClassB.parent === ClassA; // => true
```

###4. method( method\_name, function )
定义方法，方法会被子类继承，并且能够重载。

```JavaScript
    var ClassA = Class('ClassA', Object)
        .method('constructor', function(){
            // 构造函数
            this.name = 'no name';
        })
        .method('constructor', function(name){
            // 重载构造函数
            this.name = name;
        })
        .method('run', function(){
            // 普通方法
            console.log('run');
        })
        .method('run', function(a,b){
            // 重载上面定义的run方法
            console.log('run a, b: ', a, b);
        })
        .method('run', '*', function(){
            // 其他任意参数的情况
            console.log(arguments);
        });

    var a = ClassA();
    var b = ClassA('Li Lei');
    console.log(a.name); // => no name
    console.log(b.name); // => Li Lei
    a.run(); // => run
    a.run(1,2); // => run a, b: 1 2
    a.run(4,5,6); // => [4,5,6]
    a.run(7,8,9,0,1,2,3); // => [7,8,9,0,1,2,3]
```

###5. classmethod( method\_name, function )
定义类方法，类方法不会被子类继承，也不能重载。

```JavaScript
    var ClassA = Class('ClassA', Object)
        .classmethod('run', function(){
            // 类方法
            console.log('class method run');
        });

    ClassA.run(); // => class method run
```

###6. extend( class\_name )
继承出新类。

```JavaScript
    var ClassA = Class('ClassA', Object);

    // 下面两种写法是等价的
    var ClassB = Class('ClassB', ClassB);
    var ClassB = ClassA.extend('ClassB');
```

###7. alias( alias\_name , method\_name )
给方法取别名

```JavaScript
    var ClassA = Class('ClassA', Object)
        .method('run', function(){
            // 普通方法
            console.log('run');
        });

    ClassA.alias('aliasRun', 'run');

    var a = ClassA();
    a.run(); // => run
    a.aliasRun(); // => run
    a.run === a.aliasRun; // => true
```

###8. uper( method\_name )
调用父类方法

```JavaScript
    var ClassA = Class('ClassA', Object)
        .method('run', function(){
            // 普通方法
            console.log('ClassA run');
        });

    var ClassB = ClassA.extend('ClassB')
        .method('run', function(){
            ClassB.uper('run').apply(this, arguments);
            console.log('ClassB run');
        });

    var ClassC = ClassB.extend('ClassC')
        .method('run', function(){
            ClassC.uper('run').apply(this, arguments);
            console.log('ClassC run');
        });

    var c = ClassC();
    a.run();
    // => ClassA run
    // => ClassB run
    // => ClassC run
```
