import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import Card from './UI/Card'
import Button from './UI/Button'

export default function Profile({ user }) {
  const [soldItems, setSoldItems] = useState([])
  const [activeItems, setActiveItems] = useState([])
  const [myBids, setMyBids] = useState([])
  const [bidAuctions, setBidAuctions] = useState([])
  const [contactRequests, setContactRequests] = useState([])
  const [buyRequests, setBuyRequests] = useState([])
  const [bidInputs, setBidInputs] = useState({})

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    const { data: sold } = await supabase
      .from('items')
      .select('*')
      .eq('seller_username', user)
      .eq('is_sold', true)
    setSoldItems(sold || [])

    const { data: active } = await supabase
      .from('items')
      .select('*')
      .eq('seller_username', user)
      .eq('is_sold', false)
    setActiveItems(active || [])

    const { data: bids } = await supabase
      .from('bids')
      .select('*, auctions(*)')
      .eq('bidder_username', user)
    setMyBids(bids || [])

    const auctionsMap = {}
    bids?.forEach(bid => {
      const a = bid.auctions
      if (a) auctionsMap[a.auction_id] = a
    })
    setBidAuctions(Object.values(auctionsMap))

    const { data: contacts } = await supabase
      .from('contact_requests')
      .select('*, buyer:buyer_username(phone_number, facebook_username)')
      .eq('seller_username', user)
    setContactRequests(contacts || [])

    const { data: buyReq } = await supabase
      .from('contact_requests')
      .select('*, items(*)')
      .eq('buyer_username', user)
    setBuyRequests(buyReq || [])
  }

  const getContactsForItem = (item_id) => {
    return contactRequests.filter(c => c.item_id === item_id)
  }

  const getUserHighestBid = (auctionId) => {
    const bidsForAuction = myBids.filter(b => b.auction_id === auctionId)
    return bidsForAuction.length > 0 ? Math.max(...bidsForAuction.map(b => b.bid_amount)) : 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <h2 className="text-3xl font-bold mb-6 text-center text-indigo-600">Welcome, {user}</h2>

          {/* Sold Items */}
          <div className="mb-10">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Items Sold</h3>
            {soldItems.length === 0 ? (
              <p className="text-gray-500 italic">No items sold.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {soldItems.map(item => (
                  <Card key={item.item_id}>
                    <h4 className="font-bold text-green-700 mb-2">{item.title}</h4>
                    {item.image_url && <img src={item.image_url} alt={item.title} className="w-full h-40 object-cover rounded" />}
                    <p className="text-gray-700 mt-2">Price: ₹{item.price}</p>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Active Listings */}
          <div className="mb-10">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Active Listings (Your Posts)</h3>
            {activeItems.length === 0 ? (
              <p className="text-gray-500 italic">No active listings.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeItems.map(item => (
                  <Card key={item.item_id}>
                    <h4 className="font-bold text-purple-700 mb-2">{item.title}</h4>
                    {item.image_url && (
                      <img src={item.image_url} alt={item.title} className="w-full h-40 object-cover rounded" />
                    )}
                    <p className="text-gray-700 mt-2">Price: ₹{item.price}</p>

                    <h5 className="mt-3 text-sm text-gray-600">Contact Requests:</h5>
                    {getContactsForItem(item.item_id).length === 0 ? (
                      <p className="text-xs text-gray-500 italic">No requests yet.</p>
                    ) : (
                      <ul className="text-sm mt-1">
                        {getContactsForItem(item.item_id).map(req => (
                          <li key={req.request_id} className="p-1 border rounded bg-white shadow-sm mb-1">
                            {req.buyer_username}
                            {req.buyer?.phone_number ? ` - ${req.buyer.phone_number}` : ''}
                            {req.buyer?.facebook_username ? ` - ${req.buyer.facebook_username}` : ''}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="flex justify-between mt-4 space-x-2">
                      <Button
                        color="green"
                        onClick={async () => {
                          const confirm = window.confirm("Mark this item as sold?")
                          if (!confirm) return

                          await supabase
                            .from('items')
                            .update({ is_sold: true })
                            .eq('item_id', item.item_id)

                          fetchHistory()
                        }}
                      >
                        Mark as Sold
                      </Button>

                      <Button
                        color="red"
                        onClick={async () => {
                          const confirm = window.confirm("Are you sure you want to delete this item? This cannot be undone.")
                          if (!confirm) return

                          await supabase
                            .from('items')
                            .delete()
                            .eq('item_id', item.item_id)

                          fetchHistory()
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Auctions Bid On */}
          <div className="mb-10">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Auctions You've Bid On</h3>
            {bidAuctions.length === 0 ? (
              <p className="text-gray-500 italic">No auctions bid on.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {bidAuctions.map(auction => {
                  const userBid = getUserHighestBid(auction.auction_id)
                  const currentInput = bidInputs[auction.auction_id] || (auction.current_price + 1)

                  const handleBidChange = (val) => {
                    setBidInputs(prev => ({ ...prev, [auction.auction_id]: val }))
                  }

                  const handlePlaceBid = async () => {
                    if (currentInput <= auction.current_price) {
                      alert("Bid must be higher than the current price.")
                      return
                    }

                    await supabase.from('bids').insert({
                      auction_id: auction.auction_id,
                      bidder_username: user,
                      bid_amount: currentInput
                    })

                    await supabase.from('auctions')
                      .update({ current_price: currentInput })
                      .eq('auction_id', auction.auction_id)

                    fetchHistory()
                  }

                  return (
                    <Card key={auction.auction_id}>
                      <h4 className="font-bold text-yellow-700 mb-2">{auction.title}</h4>
                      {auction.image_url && <img src={auction.image_url} alt={auction.title} className="w-full h-40 object-cover rounded" />}
                      <p className="text-gray-700 mt-2">Current Price: ₹{auction.current_price}</p>
                      <p className="text-sm text-gray-500">Your Highest Bid: ₹{userBid}</p>
                      <p className="text-xs text-gray-500 mt-1">Ends at: {new Date(auction.end_time).toLocaleString()}</p>

                      {auction.current_price > userBid ? (
                        <div className="mt-3">
                          <input
                            type="number"
                            min={auction.current_price + 1}
                            value={currentInput}
                            onChange={e => handleBidChange(Number(e.target.value))}
                            className="p-2 border rounded w-full mb-2"
                          />
                          <Button color="yellow" onClick={handlePlaceBid}>
                            Place New Bid
                          </Button>
                        </div>
                      ) : (
                        <p className="text-green-600 font-semibold mt-3">You're the highest bidder</p>
                      )}
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Buy Requests Sent */}
          <div className="mb-10">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Buy Requests Sent</h3>
            {buyRequests.length === 0 ? (
              <p className="text-gray-500 italic">No buy requests sent.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {buyRequests.map(req => (
                  <Card key={req.request_id}>
                    <h4 className="font-bold text-blue-700 mb-2">{req.items?.title || `Item #${req.item_id}`}</h4>
                    {req.items?.image_url && <img src={req.items.image_url} alt={req.items.title} className="w-full h-40 object-cover rounded" />}
                    <p className="text-gray-700 mt-2">Seller: {req.seller_username}</p>
                    {req.phone_number && <p className="text-sm">Phone: {req.phone_number}</p>}
                    {req.facebook_username && <p className="text-sm">FB: {req.facebook_username}</p>}
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <Button color="blue" onClick={fetchHistory}>Refresh Profile</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
