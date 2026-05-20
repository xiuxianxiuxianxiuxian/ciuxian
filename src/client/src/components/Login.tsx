import React, { useState } from 'react'
import { useGameStore } from '../stores/gameStore'
import { api } from '../api/client'

function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { setPlayer } = useGameStore()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      if (isRegister) {
        const result = await api.auth.register(username, email, password)
        if (result.error) {
          setError(result.error)
          return
        }
        if (result.data?.player) {
          setPlayer(result.data.player)
        }
      } else {
        const result = await api.auth.login(username, password)
        if (result.error) {
          setError(result.error)
          return
        }
        if (result.data?.player) {
          setPlayer(result.data.player)
        }
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
    }
  }
  
  return (
    <div className="min-h-screen bg-erosion-dark flex items-center justify-center">
      <div className="bg-erosion-gray p-8 rounded-lg shadow-2xl w-96">
        <h1 className="text-3xl font-bold text-erosion-glow mb-6 text-center">
          噬界
        </h1>
        <h2 className="text-xl text-gray-300 mb-4 text-center">
          {isRegister ? '注册' : '登录'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-erosion-dark border border-gray-600 rounded focus:border-erosion-glow focus:outline-none"
              required
            />
          </div>
          
          {isRegister && (
            <div>
              <input
                type="email"
                placeholder="邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-erosion-dark border border-gray-600 rounded focus:border-erosion-glow focus:outline-none"
                required
              />
            </div>
          )}
          
          <div>
            <input
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-erosion-dark border border-gray-600 rounded focus:border-erosion-glow focus:outline-none"
              required
            />
          </div>
          
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          
          <button
            type="submit"
            className="w-full bg-erosion-glow hover:bg-red-600 text-white py-2 rounded transition"
          >
            {isRegister ? '注册' : '登录'}
          </button>
        </form>
        
        <button
          onClick={() => setIsRegister(!isRegister)}
          className="w-full mt-4 text-gray-400 hover:text-white"
        >
          {isRegister ? '已有账号？登录' : '没有账号？注册'}
        </button>
      </div>
    </div>
  )
}

export default Login
