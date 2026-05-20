import { useState, useEffect } from 'react'
import { useGameStore } from '../stores/gameStore'
import { api } from '../api/client'

function EconomyPanel() {
  const { player } = useGameStore()
  const [activeTab, setActiveTab] = useState<'inventory' | 'market' | 'crafting'>('inventory')
  const [inventory, setInventory] = useState<any[]>([])
  const [market, setMarket] = useState<any[]>([])
  const [recipes, setRecipes] = useState<any[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (player) {
      loadInventory()
    }
  }, [player])

  useEffect(() => {
    if (activeTab === 'market') {
      loadMarket()
    } else if (activeTab === 'crafting') {
      loadRecipes()
    }
  }, [activeTab])

  const loadInventory = async () => {
    if (!player) return
    const result = await api.economy.getPlayerInventory(player.id)
    if (result.data?.inventory) {
      setInventory(result.data.inventory)
    }
  }

  const loadMarket = async () => {
    const result = await api.economy.getMarket()
    if (result.data?.listings) {
      setMarket(result.data.listings)
    }
  }

  const loadRecipes = async () => {
    const result = await api.economy.getCraftingRecipes()
    if (result.data?.recipes) {
      setRecipes(result.data.recipes)
    }
  }

  const handleEquipItem = async (itemId: string, equipped: boolean) => {
    if (!player) return
    const result = await api.economy.equipItem(player.id, itemId, equipped)
    if (result.data) {
      setSuccess(equipped ? '装备成功' : '卸下装备')
      loadInventory()
    } else if (result.error) {
      setError(result.error)
    }
  }

  const handleCreateListing = async (itemId: string, quantity: number, price: number) => {
    if (!player) return
    const result = await api.economy.createMarketListing(player.id, itemId, quantity, price)
    if (result.data) {
      setSuccess('物品已上架')
      loadInventory()
      loadMarket()
    } else if (result.error) {
      setError(result.error)
    }
  }

  const handleBuyListing = async (listingId: string) => {
    if (!player) return
    const result = await api.economy.buyMarketItem(listingId, player.id)
    if (result.data) {
      setSuccess('购买成功')
      loadInventory()
      loadMarket()
    } else if (result.error) {
      setError(result.error)
    }
  }

  const handleCancelListing = async (listingId: string) => {
    if (!player) return
    const result = await api.economy.cancelMarketListing(listingId, player.id)
    if (result.data) {
      setSuccess('商品已下架')
      loadInventory()
      loadMarket()
    } else if (result.error) {
      setError(result.error)
    }
  }

  const handleCraftItem = async (recipeId: string, quantity: number) => {
    if (!player) return
    const result = await api.economy.craftItem(player.id, recipeId, quantity)
    if (result.data) {
      setSuccess(result.data.message)
      loadInventory()
    } else if (result.error) {
      setError(result.error)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case '普通': return 'text-gray-300'
      case '稀有': return 'text-blue-400'
      case '传说': return 'text-yellow-400'
      default: return 'text-gray-300'
    }
  }

  if (!player) return null

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-erosion-glow">经济系统</h2>

      <div className="bg-erosion-gray p-4 rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-300">玩家资产</h3>
          <div className="flex space-x-6">
            <div>
              <span className="text-gray-400">金币: </span>
              <span className="text-yellow-400 font-bold">{(player as any).gold || 0}</span>
            </div>
            <div>
              <span className="text-gray-400">精华: </span>
              <span className="text-purple-400 font-bold">{(player as any).essence || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-500 p-3 rounded text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-900 border border-green-500 p-3 rounded text-green-300">
          {success}
        </div>
      )}

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-6 py-3 rounded ${
            activeTab === 'inventory' ? 'bg-erosion-glow' : 'bg-gray-700'
          }`}
        >
          背包
        </button>
        <button
          onClick={() => setActiveTab('market')}
          className={`px-6 py-3 rounded ${
            activeTab === 'market' ? 'bg-erosion-glow' : 'bg-gray-700'
          }`}
        >
          市场
        </button>
        <button
          onClick={() => setActiveTab('crafting')}
          className={`px-6 py-3 rounded ${
            activeTab === 'crafting' ? 'bg-erosion-glow' : 'bg-gray-700'
          }`}
        >
          制造
        </button>
      </div>

      {activeTab === 'inventory' && (
        <div className="bg-erosion-gray p-6 rounded-lg shadow-xl">
          <h3 className="text-xl font-bold text-gray-300 mb-4">背包</h3>
          {inventory.length === 0 ? (
            <div className="text-gray-500 text-center py-8">背包是空的</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inventory.map((invItem) => (
                <div
                  key={invItem.id}
                  className={`bg-gray-800 p-4 rounded border-2 ${
                    invItem.equipped ? 'border-green-500' : 'border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={`font-bold ${getRarityColor(invItem.item.rarity)}`}>
                      {invItem.item.name}
                    </h4>
                    <span className="text-gray-400">x{invItem.quantity}</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{invItem.item.description}</p>
                  <div className="text-xs text-gray-500 mb-2">
                    {invItem.item.type} · {invItem.item.rarity}
                  </div>
                  {invItem.item.effect && (
                    <div className="text-xs text-green-400 mb-3">
                      {Object.entries(invItem.item.effect as Record<string, number>).map(([key, value]) => (
                        <div key={key}>{key}: +{value}</div>
                      ))}
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEquipItem(invItem.itemId, !invItem.equipped)}
                      disabled={!['武器', '防具', '饰品'].includes(invItem.item.type)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 py-2 rounded text-sm"
                    >
                      {invItem.equipped ? '卸下' : '装备'}
                    </button>
                    <button
                      onClick={() => {
                        const price = prompt('出售价格', (invItem.item.value * 2).toString())
                        if (price) {
                          const quantity = parseInt(prompt('数量', invItem.quantity.toString()) || '1')
                          handleCreateListing(invItem.itemId, quantity, parseInt(price))
                        }
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded text-sm"
                    >
                      上架
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'market' && (
        <div className="bg-erosion-gray p-6 rounded-lg shadow-xl">
          <h3 className="text-xl font-bold text-gray-300 mb-4">市场</h3>
          {market.length === 0 ? (
            <div className="text-gray-500 text-center py-8">市场暂无商品</div>
          ) : (
            <div className="space-y-4">
              {market.map((listing) => (
                <div key={listing.id} className="bg-gray-800 p-4 rounded flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className={`font-bold ${getRarityColor(listing.item.rarity)}`}>
                        {listing.item.name}
                      </h4>
                      <span className="text-gray-400">x{listing.quantity}</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{listing.item.description}</p>
                    <div className="text-xs text-gray-500">
                      卖家: {listing.seller.username}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 ml-6">
                    <div className="text-yellow-400 font-bold text-lg">
                      {listing.price} 金币
                    </div>
                    {listing.sellerId === player.id ? (
                      <button
                        onClick={() => handleCancelListing(listing.id)}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                      >
                        下架
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuyListing(listing.id)}
                        disabled={(player as any).gold < listing.price}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded"
                      >
                        购买
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'crafting' && (
        <div className="bg-erosion-gray p-6 rounded-lg shadow-xl">
          <h3 className="text-xl font-bold text-gray-300 mb-4">制造</h3>
          {recipes.length === 0 ? (
            <div className="text-gray-500 text-center py-8">暂无配方</div>
          ) : (
            <div className="space-y-4">
              {recipes.map((recipe) => {
                const canCraft = player.level >= recipe.levelRequired
                return (
                  <div key={recipe.id} className="bg-gray-800 p-4 rounded">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className={`font-bold ${getRarityColor(recipe.result.rarity)}`}>
                          {recipe.name}
                        </h4>
                        <p className="text-sm text-gray-400">{recipe.description}</p>
                        <div className="text-xs text-gray-500 mt-1">
                          需要等级: {recipe.levelRequired} · 花费: {recipe.cost} 金币
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const quantity = parseInt(prompt('数量', '1') || '1')
                          handleCraftItem(recipe.id, quantity)
                        }}
                        disabled={!canCraft}
                        className="bg-erosion-glow hover:bg-red-600 disabled:bg-gray-600 px-6 py-2 rounded"
                      >
                        制造
                      </button>
                    </div>
                    <div className="border-t border-gray-600 pt-4">
                      <div className="text-sm text-gray-400 mb-2">材料:</div>
                      <div className="flex space-x-4">
                        {recipe.ingredient1 && (
                          <div className="text-sm">
                            {recipe.ingredient1.name} x{recipe.ingredient1Quantity}
                          </div>
                        )}
                        {recipe.ingredient2 && (
                          <div className="text-sm">
                            {recipe.ingredient2.name} x{recipe.ingredient2Quantity}
                          </div>
                        )}
                        {recipe.ingredient3 && (
                          <div className="text-sm">
                            {recipe.ingredient3.name} x{recipe.ingredient3Quantity}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default EconomyPanel
