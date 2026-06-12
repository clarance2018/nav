/**
 * Navigation 便签和待办功能模块
 * 功能：便签管理、待办事项管理（按需注入版本）
 * 存储：localStorage
 * 作者：雷布斯工程师
 * 版本：2.0.0
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
    this.notesInjected = false
    this.todoInjected = false
    this.init()
  }

  /**
   * 初始化UI
   */
  init() {
    console.log('NotesTodoUI: 初始化...')

    // 等待DOM加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupEventListeners())
    } else {
      this.setupEventListeners()
    }
  }

  /**
   * 设置事件监听器（使用MutationObserver监听Tab面板变化）
   */
  setupEventListeners() {
    console.log('NotesTodoUI: 设置事件监听器...')

    // 使用MutationObserver监听Tab面板内容变化
    // 因为Vue/Naive UI的Tab点击事件不会冒泡到document
    this.observeTabChanges()

    console.log('NotesTodoUI: 事件监听器设置完成')
  }

  /**
   * 监听Tab面板变化
   * 使用MutationObserver检测Tab切换
   */
  observeTabChanges() {
    // 等待Tab面板渲染完成
    const waitForPaneWrapper = () => {
      const paneWrapper = document.querySelector('.n-tabs-pane-wrapper')
      if (paneWrapper) {
        console.log('NotesTodoUI: 找到Tab面板，开始监听')
        this.setupPaneObserver(paneWrapper)
      } else {
        // 如果还没渲染，继续等待
        setTimeout(waitForPaneWrapper, 100)
      }
    }
    waitForPaneWrapper()
  }

  /**
   * 设置面板变化监听器
   * @param {Element} paneWrapper - Tab面板容器
   */
  setupPaneObserver(paneWrapper) {
    // 检查当前面板内容
    this.checkAndInject(paneWrapper)

    // 创建MutationObserver监听子元素变化
    const observer = new MutationObserver((mutations) => {
      console.log('NotesTodoUI: 检测到Tab面板变化')
      this.checkAndInject(paneWrapper)
    })

    // 监听子元素变化
    observer.observe(paneWrapper, {
      childList: true,
      subtree: true,
      characterData: true
    })

    console.log('NotesTodoUI: MutationObserver已设置')
  }

  /**
   * 检查并注入UI
   * @param {Element} paneWrapper - Tab面板容器
   */
  checkAndInject(paneWrapper) {
    const paneContent = paneWrapper.textContent || ''

    // 检查是否是便签Tab（显示"即将完善"）
    if (paneContent.includes('即将完善')) {
      console.log('NotesTodoUI: 检测到便签Tab，准备注入')
      // 重置待办注入状态，以便切换回来时可以重新注入
      this.todoInjected = false
      setTimeout(() => this.injectNotesUI(), 50)
    }

    // 检查是否是待办Tab（显示"还能有啥呢"）
    if (paneContent.includes('还能有啥呢')) {
      console.log('NotesTodoUI: 检测到待办Tab，准备注入')
      // 重置便签注入状态，以便切换回来时可以重新注入
      this.notesInjected = false
      setTimeout(() => this.injectTodoUI(), 50)
    }
  }

  /**
   * 获取当前活动的Tab面板
   * @returns {Element|null} 当前活动的Tab面板元素
   */
  getActiveTabPane() {
    // 直接查找 .n-tab-pane 元素（Naive UI 渲染的面板）
    return document.querySelector('.n-tab-pane')
  }

  /**
   * 注入便签UI
   */
  injectNotesUI() {
    if (this.notesInjected) {
      console.log('NotesTodoUI: 便签UI已注入，跳过')
      return
    }

    console.log('NotesTodoUI: 注入便签UI...')

    // 获取当前活动的Tab面板
    const tabPane = this.getActiveTabPane()
    if (!tabPane) {
      console.log('NotesTodoUI: 未找到Tab面板')
      return
    }

    // 清空面板内容（删除占位符）
    tabPane.innerHTML = ''

    // 创建便签容器
    const container = document.createElement('div')
    container.className = 'notes-container'
    container.innerHTML = this.renderNotesUI()

    // 注入到Tab面板
    tabPane.appendChild(container)
    this.notesInjected = true

    console.log('NotesTodoUI: 便签UI注入完成')
  }

  /**
   * 注入待办UI
   */
  injectTodoUI() {
    if (this.todoInjected) {
      console.log('NotesTodoUI: 待办UI已注入，跳过')
      return
    }

    console.log('NotesTodoUI: 注入待办UI...')

    // 获取当前活动的Tab面板
    const tabPane = this.getActiveTabPane()
    if (!tabPane) {
      console.log('NotesTodoUI: 未找到Tab面板')
      return
    }

    // 清空面板内容（删除占位符）
    tabPane.innerHTML = ''

    // 创建待办容器
    const container = document.createElement('div')
    container.className = 'todo-container'
    container.innerHTML = this.renderTodoUI()

    // 注入到Tab面板
    tabPane.appendChild(container)
    this.todoInjected = true

    console.log('NotesTodoUI: 待办UI注入完成')
  }

  /**
   * 渲染便签UI
   * @returns {string} HTML字符串
   */
  renderNotesUI() {
    return `
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
  }

  /**
   * 渲染待办UI
   * @returns {string} HTML字符串
   */
  renderTodoUI() {
    return `
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
