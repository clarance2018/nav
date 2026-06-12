/**
 * Navigation 便签和待办功能模块
 * 功能：便签管理、待办事项管理（核心数据层）
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

// ==================== 初始化 ====================
// 创建全局实例
window.notesManager = new NotesManager()
window.todoManager = new TodoManager()

console.log('NotesTodoUI: 数据层初始化完成')
console.log('NotesTodoUI: 便签数量:', window.notesManager.notes.length)
console.log('NotesTodoUI: 待办数量:', window.todoManager.todos.length)
