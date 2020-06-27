## 当谈论到优化 react 性能时,通常在指什么?

广义上讲, 优化 react 性能涉及如下方面

- service workers
- lazy loading images
- code splitting
- minification
- tree shaking

不过, 上面这些都是 load time performance, 本篇在于只讨论 runtime performance.

该怎么知道你的 react 程序有性能问题?

或许并不需要. 大部分情况下, 细微的性能问题感受不出来. 当代设备计算能力很强, 一般的性能问题都感觉不出来, 就算体会得到, 这通常也不个大问题, 也许只是小卡顿.

> 不要过早的优化还没有明显性能问题的代码.

![](ppt/QQ截图20200624162552.png)
当遇到卡顿现象时, 就能感受到性能问题, 遇到时, 打开浏览器 devtools-performance.
最上面箭头指向的一行是 fps(帧数), 绿色时一切正常, 红色时糟糕透顶几乎为 0.
下面箭头指向的则是主线程的情况, 右上角标记为红色意味着这是一个 long task, 这段卡顿的时间将极大的降低用户体验: 界面僵住, 无法进行点击按钮之类的任何交互. 一般来说, 可明显感知到的卡顿为 100ms.

## 如何优化运行时性能?

- 确定问题存在位置
- 估计卡顿时间
- 改进
- 打开 dep tools
- 重复上述步骤直到可确认性能没有问题

当动画以 60 帧运行时, 一帧时长为 16.66ms, 在 dev tools 的 frames 一行中可以看到每一帧的情况, 点击具体某一帧还可查看详细信息.
![方框内为一帧](ppt/frames一帧.png)

`Main`中的所有任务于鼠标 hover 上时都会显示运行的任务详情与耗时.
![](ppt/hover-a-task.png)

`timings`中可以看到 User Timings, 图中 react 已经用 User Timings API(performance.mark 与 performance.measure) 对内部的一些关键步骤定义了标记和说明, 这比看`frames`和`main`那两项要直观得多.
![](ppt/user-timings.png)

## React 中的常见性能问题

- 最常见的情况: 由于 props/state 的依赖导致的不必要渲染
- React 并没有默认对重渲染进行处理: 未进行任何处理时, 界面上一个组件视觉上有明显变化, 那么 React 将会重新渲染它的所有子组件
- React 在渲染大量组件时的性能并不怎么样

默认情况下, 一旦父组件渲染, 所以子组件都要跟着渲染, 哪怕子组件的状态并没有改变, 这种情况下子组件的渲染就变得多余.

> 大多数时候，并不需要考虑去优化不必要的重新渲染。

观察 react 性能的最佳方法: 在 React development tools - Profiler 里查看
![](ppt/react-profiler-ranked.png)

## 使用 memo/PureComponent

两者的表现非常一致, 默认实现了一个传统 class 组件中的 shouldComponentUpdate 方法, 浅比较 props 里所有的值, 如果与之前的 props 内的值浅相等, 则不重新渲染组件. memo 则用于 function 组件, 当不传递第二个参数时, 则为上述的默认行为, 也可以给它手动传递第二个判断函数参数, 类似于 shouldComponentUpdate.

## 用 hooks 方法缓存没必要改变的值.

- `useState` 缓存反映在组件状态与 UI 渲染相关的值.
- `useRef` 缓存不会反映在 组件状态与 UI 渲染相关的值, 或存储 dom 的 ref.
- `useMemo` 用于缓存一个计算开销较大的, 需要 memoized 的值.
- `useCallback` 效果与 `useMemo` 返回值类型为 function 时一致. 当一个使用组件时, 通过 props 传递回调函数，如果函数使用 function 关键字或者使用箭头函数, 直接声明在当前组件内部, 那么每次 render 时函数的引用都会变化, 导致子组件 re-render.

共通点:
- 当 deps 不变时, hooks 会直接返回上一次计算的结果, 不会重新调用回调, 从而使子组件跳过初始化与渲染.
- 如果 `useMemo` / `useCallback` 的 deps 依赖数组为空 `[]`, 则用于存储一个仅在第一次 render 时初始化一次, 此后一直不变的值.

> 对于复杂组件, 在每次 state 更新时, 不要创建不必要的新 object / array / function 作为 props 传递给子组件

### 不能过度滥用 `useMemo`, `useCallback` 等 hooks 方法

此外, 如果 deps 频繁变动, 也要思考使用 `useMemo` 是否有必要. 因为 `useMemo` 占用了额外的空间缓存一些值, 还需要在每次 render 时检查 deps 与上一次相比是否变动, 如果不相等才会重新执行回调函数, 反而比不使用 `useMemo` 开销更大一些.


以`useMemo`为例, 当返回的是原始数据类型, 即使参与了计算, 只要 deps 依赖的内容不变, 返回结果也很可能是不变的. 此时就需要权衡这个计算的时间成本和 `useMemo` 额外带来的空间成本（缓存上一次的结果）了.
在使用 `useMemo` 前, 应该先思考三个问题：

1. 传递给 `useMemo` 的函数开销大不大？ 有些计算开销很大, 就需要缓存它的返回值, 避免每次 render 都去重新计算. 如果你执行的操作开销不大, 那么就不需要记住返回值. 否则, 使用 `useMemo` 本身的开销就可能超过重新计算这个值的开销. 因此, 对于一些简单的 JS 运算来说, 不需要使用 `useMemo` 来缓存它的返回值.

2. 返回的值是原始类型的值吗？ 如果计算出的是原始类型值, 那么每次比较都是相等的, 子组件就不会重新渲染.
如果计算出的是复杂类型的值（object / array）, 哪怕内部值不变, 但是地址已发生变化, 这会导致子组件重新渲染. 当子组件中囊括众多组件时, 就算重新渲染 dom 开销不大, 但组件中的初始化操作等各种生命周期/hooks 函数也会无意义的多余执行(这个性能问题, 在当组件复杂, 或更新频繁时将尤为突出), 因此也需要缓存这个值.

3. 是否用于自定义 hook 中? 在编写自定义 hook 时, 返回值一定要保持引用的一致性. 因为你无法确定外部要如何这个自定义 hook 的返回值. 如果返回值被用做其他 hook 的依赖, 并且每次 re-render 时返回值的引用不一致（当值相等的情况）, 就可能会产生 bug. 所以如果自定义 hook 中暴露出来的值是 object、array、function 等, 都应该使用 `useMemo`/`useCallback`. 以确保当值相同时, 引用不发生变化.

比如：

```js
const Comp = () => {
  const [data1, setData1] = useState();
  const data2 = `useMemo`(() => ({ type: 'xxx' }), []);
  const handleClick = function () {
    const val = dosth(data2);
    setData1(val);
  };
  return <Child data={data2} onClick={handleClick} />;
};
```

当 data2 会不断变化时, 可以被替换为：

```js
const Comp = () => {
  const [data1, setData1] = useState();
  const { current: data2 } = useRef({ type: 'xxx' });
  const handleClick = `useCallback`(() => {
    const val = dosth(data2);
    setData1(val);
  }, []);
  return <Child data={data2} onClick={handleClick} />;
};
```

如果 data2 不会变, 且可以预计 Child 内元素非常简单时(比如其中只有几个 dom 元素, 也没有嵌套其他组件), 也可以很简单的写成：

```js
const data2 = { type: 'xxx' };
const Comp = () => {
  const [data1, setData1] = useState();
  return (
    <Child
      data={data2}
      onClick={() => {
        const val = dosth(data2);
        setData1(val);
      }}
    />
  );
};
```

## 与 vue 3.0 的比较

## List

页面中随处可见list. map 一个 react component list 是极为常见的情况, 但当 list 数量增加且每一项都更复杂时, 滚动页面会极为明显的出现页面性能的现象, 而 list virtualization (常见的诸如`react-window`这种库) 则是对这种情况非常好的解决方式: 对于一组 list 元素, 不全部渲染 dom 在页面中, 只渲染在屏幕内出现的元素. 使用, 可有效降低大列表对性能的影响.

## cpu 占用率高的任务卡住主线程

- web 应用与 UI 都运行在主线程
- cpu 密集的占资源任务, 有可能会拖延应用的交互 (UI 线程和应用的运行代码被阻塞)

使用 react 进行页面元素管理比原生 dom 要更占资源, 如果页面上要进行很占 cpu 资源的任务则会导致明显卡顿, 可使用 web worker 来防止主线程阻塞.
