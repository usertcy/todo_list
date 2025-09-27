// 2.todo.js 加载完成后会等待 DOM 树完全解析完成后才执行内部逻辑,内部代码按从上到下顺序依次执行
document.addEventListener('DOMContentLoaded', function () {
    // 获取DOM元素
    const taskInput = document.getElementById('task-input');
    const addbtn = document.getElementById('add-btn');
    const taskList = document.getElementById('task-list');
    const taskCount = document.getElementById('task-count');
    const clearAllBtn = document.getElementById('clear-all');
    const clearCompletedBtn = document.getElementById('clear-completed');




    // 从本地存储加载任务
    // localStorage.getItem从本地存储中获取键为tasks的数据
    //JSON.parse将获取到的字符串数据解析为 JavaScript 对象
    //当左侧的值为 falsy 值（这里可能是 null，因为如果没有 'tasks' 这个键，getItem 会返回 null）时，就使用右侧的空数组[]
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];




    // 初始化,定义一个名为 init 的函数
    function init() {
        // 显示任务列表
        renderTasks();
        // 更新任务计数
        updateTaskCount();
        // 让页面中的输入框获取焦点,focus() 是DOM 元素自带的内置方法
        // 让指定的元素获取焦点（比如输入框会出现光标，用户可以直接输入内容，不需要先点击元素）。
        taskInput.focus();
    }



    // 渲染任务列表

    // //renderTasks() 每次渲染都会清空列表再重新创建所有任务项当任务数量较多时，频繁的 DOM 操作会导致页面卡顿。
    // //使用文档片段（DocumentFragment）批量插入 DOM，减少重绘重排

    function renderTasks() {
        // 这行代码先清空列表中已有的所有内容，为重新渲染做准备
        taskList.innerHTML = '';

        // // 创建文档片段
        const fragment = document.createDocumentFragment(); 

        //  遍历任务数据并生成列表项
        //task 是当前任务对象，index 是当前任务在数组中的索引
        tasks.forEach((task, index) => {

            // 为每个任务创建一个 <li> 元素作为容器,创建列表项
           const taskItem = document.createElement('li');

            // .className 动态给任务项元素设置 CSS 类名
            // 如果 task.completed 为 true（任务已完成），就添加 task-completed 这个类，否则不添加额外类
            taskItem.className = `task-item ${task.completed ? 'task-completed' : ''}`;


            // 设置内部 HTML 结构，动态生成单个任务项的具体内容，通过模板字符串创建了任务项内部的具体结构
            // type="checkbox" 定义这是一个复选框
            // 如果任务文本包含特殊字符（如 <script>、<img> 等），会被浏览器解析为 HTML 标签，可能导致 XSS 攻击或页面布局错乱。
            // taskItem.innerHTML =
            //     `
            //     <input type="checkbox" ${task.completed ? 'checked' : ''}  onchange="toggleTask(${index})">
            //     <span class="task-text">${task.text}</span>
            //     <button class="delete-btn" onclick="deleteTask(${index})" title="删除任务">
            //        <img src="删除.png" alt="删除" class="delete-icon">
            //     </button>
            // `;
            // onchange="toggleTask(${index})" 表示当复选框被点击（状态改变）时，会调用 toggleTask 函数，并传入当前任务的索引 index
            // onclick="deleteTask(${index})"：是事件属性，表示当点击按钮时，会执行 deleteTask(index) 函数（index 是当前任务的索引，用于定位并删除具体任务）

            // //修改 taskItem.innerHTML 部分
            taskItem.innerHTML =
                `
                 <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${index})">
                 <span class="task-text"></span> 
                 <button class="delete-btn" onclick="deleteTask(${index})" title="删除任务">
                    <img src="删除.png" alt="删除" class="delete-icon">
                 </button>
            `;
            // 单独设置文本内容（自动转义特殊字符）
            taskItem.querySelector('.task-text').textContent = task.text;

            // // 先添加到片段
             fragment.appendChild(taskItem); 

            // 把创建好的单个任务项（<li> 元素）添加到任务列表容器中appendChild()：这是 DOM 元素的 原生方法，作用是 “把一个元素添加到另一个元素的内部末尾”。
            // taskList.appendChild(taskItem);
        });

        // // 一次性插入DOM
         taskList.appendChild(fragment); 
    }




    // 更新任务计数
    function updateTaskCount() {
        //是数组的内置方法filter() 筛选出未完成的任务，然后计算数量
        const incompleteTasks = tasks.filter(task => !task.completed).length;
        // 设置 DOM 元素的文本内容.textContent 只处理纯文本
        taskCount.textContent = `当前有 ${incompleteTasks} 个待完成任务`;
    }




    // 添加新任务
    function addTask() {
        // 获取输入框中用户输入.value 是 HTML 表单元素的标准属性用于 获取或设置表单元素的当前值。
        const text = taskInput.value.trim();

        // 若为空，通过 alert 提示用户输入内容
        if (text === '') {
            // alert() 是 JavaScript 的 全局内置函数，用于在浏览器中弹出一个包含提示信息的对话框
            // 弹出时会暂停当前页面的脚本执行，直到用户点击 “确定” 按钮才继续
            alert('请输入待办内容');
            return;
        }

        // 通过 push 方法向 tasks 数组添加一个新的任务对象
        tasks.push({
            text: text,
            completed: false,
            // 任务创建时间（用 new Date().toISOString() 生成标准时间格式
            // 对象的属性不需要在 HTML 中预先定义，而是可以在代码运行时动态添加
            createdAt: new Date().toISOString()
        });

        saveTasks();
        //清空输入框，方便用户输入下一个任务
        taskInput.value = '';
        // 让输入框重新获取焦点
        taskInput.focus();
        // 显示新添加的任务
        renderTasks();
        updateTaskCount();
    }




    // 切换任务状态,定义 toggleTask 函数（仅定义，绑定到全局）
    // window.明确告诉代码阅读者：这个函数需要暴露到全局，供 HTML 中的事件调用。
    // index（必传参数）：表示要删除的任务在 tasks 数组中的索引值从 0 开始
    window.toggleTask = function (index) {
        //1. 切换任务的完成状态
        tasks[index].completed = !tasks[index].completed;

        saveTasks();
        renderTasks();
        updateTaskCount();
    }




    // 删除任务
    window.deleteTask = function (index) {
        // confirm() 是 JavaScript 内置函数,用于弹出一个带 “确定” 和 “取消” 按钮的对话框，返回值为布尔值
        if (confirm('确定要删除这个任务吗？')) {
            // splice 是数组的内置方法，用于修改数组内容,index 表示删除的起始位置,1 表示删除的数量
            tasks.splice(index, 1);

            saveTasks();
            renderTasks();
            updateTaskCount();
        }
    }




    // 清除所有任务,给 clearAllBtn 绑定点击事件
    clearAllBtn.addEventListener('click', function () {
        if (tasks.length === 0) {
            alert('没有任务可清除！');
            return;
        }

        if (confirm('确定要清除所有任务吗？')) {
            // 清空任务数组
            tasks = [];

            saveTasks();
            renderTasks();
            updateTaskCount();
        }
    });




    // 清除已完成任务
    clearCompletedBtn.addEventListener('click', function () {
        const completedTasks = tasks.filter(task => task.completed);

        if (completedTasks.length === 0) {
            alert('没有已完成的任务！');
            return;
        }

        if (confirm('确定要清除所有已完成的任务吗？')) {
            tasks = tasks.filter(task => !task.completed);

            saveTasks();
            renderTasks();
            updateTaskCount();
        }
    });




    // 保存任务到本地存储
    function saveTasks() {
        // JSON.stringify(tasks)：将任务数组转换为字符串
        // setItem(key, value) 是 localStorage 的方法，用于存储数据
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }




    // 事件监听,给 addbtn 绑定点击事件
    //  我们需要的是 “点击时执行函数”，而不是 “立即执行函数”addTask()
    // 这里传入的是函数本身（函数名，不带括号），表示 “当点击事件发生时，再去执行这个函数”。
    addbtn.addEventListener('click', addTask);



    // 当用户在输入框中按下任意键时，会执行后面的匿名函数,其中参数 e 是事件对象包含与当前按键相关的信息
    taskInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });





    // 调用 init() 函数（立即执行，触发初始化逻辑）
    init();

})