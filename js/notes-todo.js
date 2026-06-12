/**
 * Navigation 便签和待办功能模块
 * 功能：便签管理、待办事项管理
 * 存储：localStorage
 * 作者：雷布斯工程师
 * 版本：1.0.0
 */

// ==================== 便签管理器 ====================
class NotesManager {
  constructor() {
    this.notes = this.loadNotes()
    this.currentEditId = null
  }

  /**
   * 从localStorage加载便签数据
   * @returns {Array} 便签列表
   */
  loadNotes() {
    try {
      const data = localStorage.getItem('navigation_notes')
      return data ? JSON.parse(data) : []
    } catch (e) {
      console.error('加载便签数据失败:', e)
      return []
    }
  }

  /**
   * 保存便签数据到localStorage
   */
  saveNotes() {
    try {
      localStorage.setItem('navigation_notes', JSON.stringify(this.notes))
    } catch (e) {
      console.error('保存便签数据失败:', e)
    }
  }

  /**
   * 添加新便签
   * @param {string} content - 便签内容
   * @returns {Object} 新创建的便签对象
   */
  addNote(content) {
    if (!content || !content.trim()) {
      throw new Error('便签内容不能为空')
    }

    const note = {
      id: Date.now(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.notes.unshift(note)
    this.saveNotes()
    return note
  }

  /**
   * 更新便签内容
   * @param {number} id - 便签ID
   * @param {string} content - 新内容
   * @returns {Object} 更新后的便签对象
   */
  updateNote(id, content) {
    if (!content || !content.trim()) {
      throw new Error('便签内容不能为空')
    }

    const note = this.notes.find(n => n.id === id)
    if (note) {
      note.content = content.trim()
      note.updatedAt = new Date().toISOString()
      this.saveNotes()
    }
    return note
  }

  /**
   * 删除便签
   * @param {number} id - 便签ID
   */
  deleteNote(id) {
    this.notes = this.notes.filter(n => n.id !== id)
    this.saveNotes()
  }

  /**
   * 获取单个便签
   * @param {number} id - 便签ID
   * @returns {Object} 便签对象
   */
  getNote(id) {
    return this.notes.find(n => n.id === id)
  }

  /**
   * 渲染Markdown格式
   * @param {string} text - Markdown文本
   * @returns {string} HTML字符串
   */
  renderMarkdown(text) {
    if (!text) return ''

    return text
      // 标题
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // 粗体和斜体
      .replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      // 删除线
      .replace(/~~(.*?)~~/gim, '<del>$1</del>')
      // 代码
      .replace(/`(.*?)`/gim, '<code>$1</code>')
      // 链接
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>')
      // 无序列表
      .replace(/^\s*[-*+]\s+(.*$)/gim, '<li>$1</li>')
      // 有序列表
      .replace(/^\s*\d+\.\s+(.*$)/gim, '<li>$1</li>')
      // 引用
      .replace(/^\>\s+(.*$)/gim, '<blockquote>$1</blockquote>')
      // 水平线
      .replace(/^[-*_]{3,}\s*$/gim, '<hr>')
      // 换行
      .replace(/\n/gim, '<br>')
  }

  /**
   * 格式化日期
   * @param {string} isoString - ISO日期字符串
   * @returns {string} 格式化后的日期
   */
  formatDate(isoString) {
    const date = new Date(isoString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }
}

// ==================== 待办管理器 ====================
class TodoManager {
  constructor() {
    this.todos = this.loadTodos()
    this.categories = ['工作', '学习', '生活', '其他']
    this.currentFilter = 'all'
  }

  /**
   * 从localStorage加载待办数据
   * @returns {Array} 待办列表
   */
  loadTodos() {
    try {
      const data = localStorage.getItem('navigation_todos')
      return data ? JSON.parse(data) : []
    } catch (e) {
      console.error('加载待办数据失败:', e)
      return []
    }
  }

  /**
   * 保存待办数据到localStorage
   */
  saveTodos() {
    try {
      localStorage.setItem('navigation_todos', JSON.stringify(this.todos))
    } catch (e) {
      console.error('保存待办数据失败:', e)
    }
  }

  /**
   * 添加新待办
   * @param {Object} todoData - 待办数据
   * @param {string} todoData.title - 待办标题
   * @param {string} todoData.category - 分类
   * @param {string} todoData.dueDate - 截止日期
   * @returns {Object} 新创建的待办对象
   */
  addTodo(todoData) {
    if (!todoData.title || !todoData.title.trim()) {
      throw new Error('待办标题不能为空')
    }

    const todo = {
      id: Date.now(),
      title: todoData.title.trim(),
      category: todoData.category || '其他',
      dueDate: todoData.dueDate || null,
      completed: false,
      createdAt: new Date().toISOString()
    }

    this.todos.unshift(todo)
    this.saveTodos()
    this.checkReminders()
    return todo
  }

  /**
   * 切换待办完成状态
   * @param {number} id - 待办ID
   * @returns {Object} 更新后的待办对象
   */
  toggleTodo(id) {
    const todo = this.todos.find(t => t.id === id)
    if (todo) {
      todo.completed = !todo.completed
      this.saveTodos()
    }
    return todo
  }

  /**
   * 更新待办
   * @param {number} id - 待办ID
   * @param {Object} updates - 更新数据
   * @returns {Object} 更新后的待办对象
   */
  updateTodo(id, updates) {
    const todo = this.todos.find(t => t.id === id)
    if (todo) {
      if (updates.title !== undefined) todo.title = updates.title.trim()
      if (updates.category !== undefined) todo.category = updates.category
      if (updates.dueDate !== undefined) todo.dueDate = updates.dueDate
      this.saveTodos()
    }
    return todo
  }

  /**
   * 删除待办
   * @param {number} id - 待办ID
   */
  deleteTodo(id) {
    this.todos = this.todos.filter(t => t.id !== id)
    this.saveTodos()
  }

  /**
   * 获取单个待办
   * @param {number} id - 待办ID
   * @returns {Object} 待办对象
   */
  getTodo(id) {
    return this.todos.find(t => t.id === id)
  }

  /**
   * 按分类获取待办
   * @param {string} category - 分类名称
   * @returns {Array} 过滤后的待办列表
   */
  getTodosByCategory(category) {
    if (category === 'all') return this.todos
    return this.todos.filter(t => t.category === category)
  }

  /**
   * 检查提醒
   */
  checkReminders() {
    const now = new Date()
    this.todos.forEach(todo => {
      if (todo.dueDate && !todo.completed) {
        const dueDate = new Date(todo.dueDate)
        const timeDiff = dueDate - now
        const hoursDiff = timeDiff / (1000 * 60 * 60)

        // 如果24小时内到期，显示提醒
        if (hoursDiff > 0 && hoursDiff <= 24) {
          this.showReminder(todo)
        }
      }
    })
  }

  /**
   * 显示提醒
   * @param {Object} todo - 待办对象
   */
  showReminder(todo) {
    // 检查浏览器是否支持通知
    if ('Notification' in window) {
      // 请求通知权限
      if (Notification.permission === 'default') {
        Notification.requestPermission()
      }

      if (Notification.permission === 'granted') {
        new Notification('待办提醒', {
          body: `${todo.title} 即将到期！`,
          icon: '/icon/logo-144.png',
          tag: `todo-${todo.id}` // 防止重复通知
        })
      }
    }
  }

  /**
   * 格式化日期
   * @param {string} dateString - 日期字符串
   * @returns {string} 格式化后的日期
   */
  formatDate(dateString) {
    if (!dateString) return ''
    const date = new Date(dateString)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${month}-${day}`
  }

  /**
   * 检查是否已过期
   * @param {string} dateString - 日期字符串
   * @returns {boolean} 是否已过期
   */
  isOverdue(dateString) {
    if (!dateString) return false
    const dueDate = new Date(dateString)
    const now = new Date()
    return dueDate < now
  }
}

// ==================== UI管理器 ====================
class NotesTodoUI {
  constructor() {
    this.notesManager = new NotesManager()
    this.todoManager = new TodoManager()
    this.init()
  }

  /**
   * 初始化UI
   */
  init() {
    console.log('NotesTodoUI: 初始化...')

    // 等待DOM加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupUI())
    } else {
      this.setupUI()
    }
  }

  /**
   * 设置UI
   */
  setupUI() {
    console.log('NotesTodoUI: 设置UI...')

    // 监听DOM变化，找到便签和待办的Tab面板
    this.observeDOM()

    // 尝试立即注入
    this.injectUI()

    // 添加更频繁的延迟重试机制
    const retryIntervals = [100, 300, 500, 1000, 1500, 2000, 3000, 5000]
    retryIntervals.forEach((delay, index) => {
      setTimeout(() => {
        console.log(`NotesTodoUI: 延迟重试注入 (${index + 1}/${retryIntervals.length})...`)
        this.injectUI()
      }, delay)
    })

    // 添加点击Tab时的注入
    this.setupTabClickListeners()

    // 添加轮询检测机制
    this.startPolling()
  }

  /**
   * 启动轮询检测
   */
  startPolling() {
    let pollCount = 0
    const maxPolls = 20 // 最多轮询20次
    const pollInterval = 500 // 每500毫秒检测一次

    const poll = () => {
      pollCount++
      console.log(`NotesTodoUI: 轮询检测 (${pollCount}/${maxPolls})...`)

      const noteTabPane = this.findTabPane('note')
      const todoTabPane = this.findTabPane('more')

      if (noteTabPane && !noteTabPane.querySelector('.notes-container')) {
        console.log('NotesTodoUI: 轮询发现便签Tab面板，注入UI')
        this.injectNotesUI(noteTabPane)
      }

      if (todoTabPane && !todoTabPane.querySelector('.todo-container')) {
        console.log('NotesTodoUI: 轮询发现待办Tab面板，注入UI')
        this.injectTodoUI(todoTabPane)
      }

      // 如果找到了Tab面板或达到最大轮询次数，停止轮询
      if ((noteTabPane && todoTabPane) || pollCount >= maxPolls) {
        console.log('NotesTodoUI: 轮询结束')
        return
      }

      // 继续轮询
      setTimeout(poll, pollInterval)
    }

    // 开始轮询
    setTimeout(poll, pollInterval)
  }

  /**
   * 设置Tab点击监听器
   */
  setupTabClickListeners() {
    // 监听Tab点击事件
    document.addEventListener('click', (e) => {
      const tab = e.target.closest('.n-tabs-tab')
      if (tab) {
        console.log('NotesTodoUI: Tab被点击', tab)
        // 延迟注入，等待Tab面板渲染
        setTimeout(() => {
          this.injectUI()
        }, 100)
      }
    })
  }

  /**
   * 监听DOM变化
   */
  observeDOM() {
    let injectTimeout = null

    const observer = new MutationObserver((mutations) => {
      // 防抖处理，避免频繁调用
      if (injectTimeout) {
        clearTimeout(injectTimeout)
      }

      injectTimeout = setTimeout(() => {
        // 检查是否需要注入
        const noteTabPane = this.findTabPane('note')
        const todoTabPane = this.findTabPane('more')

        if (noteTabPane && !noteTabPane.querySelector('.notes-container')) {
          console.log('NotesTodoUI: DOM变化，尝试注入便签UI')
          this.injectNotesUI(noteTabPane)
        }

        if (todoTabPane && !todoTabPane.querySelector('.todo-container')) {
          console.log('NotesTodoUI: DOM变化，尝试注入待办UI')
          this.injectTodoUI(todoTabPane)
        }
      }, 100) // 减少防抖延迟到100毫秒
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  /**
   * 注入UI到页面
   */
  injectUI() {
    // 添加调试信息
    console.log('NotesTodoUI: 尝试注入UI...')

    // 查找便签Tab面板
    const noteTabPane = this.findTabPane('note')
    if (noteTabPane) {
      console.log('NotesTodoUI: 找到便签Tab面板', noteTabPane)
      if (!noteTabPane.querySelector('.notes-container')) {
        this.injectNotesUI(noteTabPane)
        console.log('NotesTodoUI: 便签UI注入成功')
      }
    } else {
      console.log('NotesTodoUI: 未找到便签Tab面板')
    }

    // 查找待办Tab面板
    const todoTabPane = this.findTabPane('more')
    if (todoTabPane) {
      console.log('NotesTodoUI: 找到待办Tab面板', todoTabPane)
      if (!todoTabPane.querySelector('.todo-container')) {
        this.injectTodoUI(todoTabPane)
        console.log('NotesTodoUI: 待办UI注入成功')
      }
    } else {
      console.log('NotesTodoUI: 未找到待办Tab面板')
    }
  }

  /**
   * 查找Tab面板
   * @param {string} tabName - Tab名称
   * @returns {Element} Tab面板元素
   */
  findTabPane(tabName) {
    // 方法1：通过name属性查找
    let pane = document.querySelector(`[name="${tabName}"]`)
    if (pane) return pane

    // 方法2：通过data属性查找
    pane = document.querySelector(`[data-name="${tabName}"]`)
    if (pane) return pane

    // 方法3：遍历所有元素，通过文本内容查找
    const allElements = document.querySelectorAll('*')
    for (const el of allElements) {
      const content = el.textContent || el.innerText
      if (tabName === 'note' && content === '即将完善') {
        return el.parentElement
      }
      if (tabName === 'more' && content === '还能有啥呢 😢') {
        return el.parentElement
      }
    }

    // 方法4：遍历所有元素，查找包含特定文本的元素
    for (const el of allElements) {
      const content = el.textContent || el.innerText
      if (tabName === 'note' && content.includes('即将完善') && el.children.length === 0) {
        return el.parentElement
      }
      if (tabName === 'more' && content.includes('还能有啥呢') && el.children.length === 0) {
        return el.parentElement
      }
    }

    return null
  }

  /**
   * 注入便签UI
   * @param {Element} container - 容器元素
   */
  injectNotesUI(container) {
    // 清空容器
    container.innerHTML = ''

    // 创建便签容器
    const notesContainer = document.createElement('div')
    notesContainer.className = 'notes-container'
    notesContainer.innerHTML = `
      <div class="notes-header">
        <div class="notes-title">
          <span class="icon">📝</span>
          <span>便签</span>
        </div>
        <button class="add-note-btn" onclick="notesTodoUI.showAddNoteModal()">
          <span class="icon">+</span>
          <span>添加</span>
        </button>
      </div>
      <div class="notes-list" id="notesList">
        ${this.renderNotesList()}
      </div>
    `

    container.appendChild(notesContainer)
  }

  /**
   * 注入待办UI
   * @param {Element} container - 容器元素
   */
  injectTodoUI(container) {
    // 清空容器
    container.innerHTML = ''

    // 创建待办容器
    const todoContainer = document.createElement('div')
    todoContainer.className = 'todo-container'
    todoContainer.innerHTML = `
      <div class="todo-header">
        <div class="todo-title">
          <span class="icon">✅</span>
          <span>待办</span>
        </div>
        <div class="todo-actions">
          <select class="category-filter" onchange="notesTodoUI.filterTodos(this.value)">
            <option value="all">全部</option>
            ${this.todoManager.categories.map(cat =>
              `<option value="${cat}">${cat}</option>`
            ).join('')}
          </select>
          <button class="add-todo-btn" onclick="notesTodoUI.showAddTodoModal()">
            <span class="icon">+</span>
            <span>添加</span>
          </button>
        </div>
      </div>
      <div class="todo-list" id="todoList">
        ${this.renderTodosList()}
      </div>
    `

    container.appendChild(todoContainer)
  }

  /**
   * 渲染便签列表
   * @returns {string} HTML字符串
   */
  renderNotesList() {
    if (this.notesManager.notes.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <div class="empty-text">还没有便签</div>
          <div class="empty-hint">点击"添加"按钮创建第一个便签</div>
        </div>
      `
    }

    return this.notesManager.notes.map(note => `
      <div class="note-item" data-id="${note.id}">
        <div class="note-content">${this.notesManager.renderMarkdown(note.content)}</div>
        <div class="note-footer">
          <div class="note-time">${this.notesManager.formatDate(note.updatedAt)}</div>
          <div class="note-actions">
            <button class="edit-btn" onclick="notesTodoUI.editNote(${note.id})">编辑</button>
            <button class="delete-btn" onclick="notesTodoUI.deleteNote(${note.id})">删除</button>
          </div>
        </div>
      </div>
    `).join('')
  }

  /**
   * 渲染待办列表
   * @returns {string} HTML字符串
   */
  renderTodosList() {
    const todos = this.todoManager.currentFilter === 'all'
      ? this.todoManager.todos
      : this.todoManager.getTodosByCategory(this.todoManager.currentFilter)

    if (todos.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-icon">✅</div>
          <div class="empty-text">还没有待办事项</div>
          <div class="empty-hint">点击"添加"按钮创建第一个待办</div>
        </div>
      `
    }

    // 按分类分组
    const groupedTodos = {}
    todos.forEach(todo => {
      if (!groupedTodos[todo.category]) {
        groupedTodos[todo.category] = []
      }
      groupedTodos[todo.category].push(todo)
    })

    return Object.entries(groupedTodos).map(([category, categoryTodos]) => `
      <div class="todo-category">
        <div class="category-header">
          <span class="category-icon">📁</span>
          <span class="category-name">${category}</span>
          <span class="category-count">${categoryTodos.length}</span>
        </div>
        <div class="category-todos">
          ${categoryTodos.map(todo => `
            <div class="todo-item ${todo.completed ? 'completed' : ''} ${this.todoManager.isOverdue(todo.dueDate) ? 'overdue' : ''}" data-id="${todo.id}">
              <div class="todo-checkbox" onclick="notesTodoUI.toggleTodo(${todo.id})">
                <input type="checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="checkmark"></span>
              </div>
              <div class="todo-info">
                <div class="todo-title">${todo.title}</div>
                ${todo.dueDate ? `
                  <div class="todo-due-date">
                    <span class="date-icon">📅</span>
                    <span>${this.todoManager.formatDate(todo.dueDate)}</span>
                  </div>
                ` : ''}
              </div>
              <div class="todo-actions">
                <button class="edit-btn" onclick="notesTodoUI.editTodo(${todo.id})">编辑</button>
                <button class="delete-btn" onclick="notesTodoUI.deleteTodo(${todo.id})">删除</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')
  }

  /**
   * 显示添加便签模态框
   */
  showAddNoteModal() {
    this.showModal('添加便签', `
      <div class="modal-form">
        <textarea id="noteContent" placeholder="输入便签内容，支持Markdown格式..." rows="6"></textarea>
        <div class="modal-hint">支持 **粗体**、*斜体*、\`代码\`、[链接](url) 等Markdown语法</div>
      </div>
    `, () => {
      const content = document.getElementById('noteContent').value
      if (content) {
        this.notesManager.addNote(content)
        this.refreshNotesList()
        this.closeModal()
      }
    })
  }

  /**
   * 编辑便签
   * @param {number} id - 便签ID
   */
  editNote(id) {
    const note = this.notesManager.getNote(id)
    if (!note) return

    this.showModal('编辑便签', `
      <div class="modal-form">
        <textarea id="noteContent" placeholder="输入便签内容..." rows="6">${note.content}</textarea>
      </div>
    `, () => {
      const content = document.getElementById('noteContent').value
      if (content) {
        this.notesManager.updateNote(id, content)
        this.refreshNotesList()
        this.closeModal()
      }
    })
  }

  /**
   * 删除便签
   * @param {number} id - 便签ID
   */
  deleteNote(id) {
    if (confirm('确定要删除这个便签吗？')) {
      this.notesManager.deleteNote(id)
      this.refreshNotesList()
    }
  }

  /**
   * 显示添加待办模态框
   */
  showAddTodoModal() {
    this.showModal('添加待办', `
      <div class="modal-form">
        <input type="text" id="todoTitle" placeholder="待办标题" required>
        <select id="todoCategory">
          ${this.todoManager.categories.map(cat =>
            `<option value="${cat}">${cat}</option>`
          ).join('')}
        </select>
        <input type="date" id="todoDueDate" placeholder="截止日期（可选）">
      </div>
    `, () => {
      const title = document.getElementById('todoTitle').value
      const category = document.getElementById('todoCategory').value
      const dueDate = document.getElementById('todoDueDate').value

      if (title) {
        this.todoManager.addTodo({ title, category, dueDate })
        this.refreshTodosList()
        this.closeModal()
      }
    })
  }

  /**
   * 编辑待办
   * @param {number} id - 待办ID
   */
  editTodo(id) {
    const todo = this.todoManager.getTodo(id)
    if (!todo) return

    this.showModal('编辑待办', `
      <div class="modal-form">
        <input type="text" id="todoTitle" placeholder="待办标题" value="${todo.title}" required>
        <select id="todoCategory">
          ${this.todoManager.categories.map(cat =>
            `<option value="${cat}" ${cat === todo.category ? 'selected' : ''}>${cat}</option>`
          ).join('')}
        </select>
        <input type="date" id="todoDueDate" value="${todo.dueDate || ''}" placeholder="截止日期（可选）">
      </div>
    `, () => {
      const title = document.getElementById('todoTitle').value
      const category = document.getElementById('todoCategory').value
      const dueDate = document.getElementById('todoDueDate').value

      if (title) {
        this.todoManager.updateTodo(id, { title, category, dueDate })
        this.refreshTodosList()
        this.closeModal()
      }
    })
  }

  /**
   * 删除待办
   * @param {number} id - 待办ID
   */
  deleteTodo(id) {
    if (confirm('确定要删除这个待办吗？')) {
      this.todoManager.deleteTodo(id)
      this.refreshTodosList()
    }
  }

  /**
   * 切换待办完成状态
   * @param {number} id - 待办ID
   */
  toggleTodo(id) {
    this.todoManager.toggleTodo(id)
    this.refreshTodosList()
  }

  /**
   * 过滤待办
   * @param {string} category - 分类名称
   */
  filterTodos(category) {
    this.todoManager.currentFilter = category
    this.refreshTodosList()
  }

  /**
   * 刷新便签列表
   */
  refreshNotesList() {
    const notesList = document.getElementById('notesList')
    if (notesList) {
      notesList.innerHTML = this.renderNotesList()
    }
  }

  /**
   * 刷新待办列表
   */
  refreshTodosList() {
    const todoList = document.getElementById('todoList')
    if (todoList) {
      todoList.innerHTML = this.renderTodosList()
    }
  }

  /**
   * 显示模态框
   * @param {string} title - 模态框标题
   * @param {string} content - 模态框内容
   * @param {Function} onConfirm - 确认回调
   */
  showModal(title, content, onConfirm) {
    // 移除已存在的模态框
    const existingModal = document.querySelector('.custom-modal')
    if (existingModal) {
      existingModal.remove()
    }

    // 创建模态框
    const modal = document.createElement('div')
    modal.className = 'custom-modal'
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-container">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="modal-close" onclick="notesTodoUI.closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
        <div class="modal-footer">
          <button class="modal-cancel" onclick="notesTodoUI.closeModal()">取消</button>
          <button class="modal-confirm" id="modalConfirm">确定</button>
        </div>
      </div>
    `

    document.body.appendChild(modal)

    // 绑定确认按钮事件
    document.getElementById('modalConfirm').addEventListener('click', onConfirm)

    // 显示模态框
    setTimeout(() => {
      modal.classList.add('show')
    }, 10)
  }

  /**
   * 关闭模态框
   */
  closeModal() {
    const modal = document.querySelector('.custom-modal')
    if (modal) {
      modal.classList.remove('show')
      setTimeout(() => {
        modal.remove()
      }, 300)
    }
  }
}

// ==================== 初始化 ====================
let notesTodoUI

// 等待页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    notesTodoUI = new NotesTodoUI()
  })
} else {
  notesTodoUI = new NotesTodoUI()
}

// 暴露到全局作用域，供HTML中的onclick使用
window.notesTodoUI = notesTodoUI
