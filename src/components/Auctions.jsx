import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import Card from './UI/Card'
import Button from './UI/Button'
import Input from './UI/Input'

export default function Auctions({ user }) {
  const [auctions, setAuctions] = useState([])
  const [bids, setBids] = useState({})
  const [newAuction, setNewAuction] = useState({ title: '', desc: '', startPrice: '', image: '', duration: '' })
  const [bidModalOpen, setBidModalOpen] = useState(false)
  const [currentAuction, setCurrentAuction] = useState(null)
  const [bidAmount, setBidAmount] = useState('')


  const fetchAuctions = async () => {
    const { data } = await supabase
      .from('auctions')
      .select('*')
      .eq('is_active', true)
      .order('end_time', { ascending: true })
    setAuctions(data || [])
  }

  useEffect(() => {
    fetchAuctions()

    const subscription = supabase
      .channel('bids-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bids' }, payload => {
        fetchBidsForAuction(payload.new.auction_id)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  const fetchBidsForAuction = async (auction_id) => {
    const { data } = await supabase
      .from('bids')
      .select('*')
      .eq('auction_id', auction_id)
      .order('bid_time', { ascending: false })

    setBids(prev => ({ ...prev, [auction_id]: data }))
  }

  const placeBid = async (auction) => {
    const bidAmount = prompt(`Enter your bid (Current: ₹${auction.current_price})`)
    if (!bidAmount) return

    if (parseFloat(bidAmount) <= parseFloat(auction.current_price)) {
      alert('Bid must be higher than current price')
      return
    }

    await supabase.from('bids').insert([{
      auction_id: auction.auction_id,
      bidder_username: user,
      bid_amount: bidAmount
    }])

    await supabase.from('auctions')
      .update({ current_price: bidAmount })
      .eq('auction_id', auction.auction_id)

    fetchBidsForAuction(auction.auction_id)
  }

  const createAuction = async () => {
    const now = new Date()
    const endTime = new Date(now.getTime() + newAuction.duration * 60 * 1000).toISOString()

    await supabase.from('auctions').insert([{
      seller_username: user,
      title: newAuction.title,
      description: newAuction.desc,
      start_price: newAuction.startPrice,
      current_price: newAuction.startPrice,
      image_url: newAuction.image,
      end_time: endTime
    }])

    setNewAuction({ title: '', desc: '', startPrice: '', image: '', duration: '' })
    fetchAuctions()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-3xl mx-auto">
        <Card>
          <h2 className="text-3xl font-bold mb-6 text-center text-purple-600">Auction Center</h2>

          <h3 className="text-xl font-semibold mb-4 text-gray-700">Create New Auction</h3>

          <Input
            type="text"
            placeholder="Title"
            value={newAuction.title}
            onChange={e => setNewAuction({ ...newAuction, title: e.target.value })}
          />
          <Input
            type="text"
            placeholder="Description"
            value={newAuction.desc}
            onChange={e => setNewAuction({ ...newAuction, desc: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Starting Price"
            value={newAuction.startPrice}
            onChange={e => setNewAuction({ ...newAuction, startPrice: e.target.value })}
          />
          <Input
            type="text"
            placeholder="Image URL"
            value={newAuction.image}
            onChange={e => setNewAuction({ ...newAuction, image: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Duration (in minutes)"
            value={newAuction.duration}
            onChange={e => setNewAuction({ ...newAuction, duration: e.target.value })}
          />
          <Button color="green" onClick={createAuction}>Start Auction</Button>
        </Card>

        <h3 className="text-2xl font-semibold my-6 text-gray-800">Active Auctions</h3>

        {auctions.length === 0 ? (
          <p className="text-center text-gray-500 italic">No active auctions</p>
        ) : (
          <div className="grid gap-5">
            {auctions.map(auction => (
              <Card key={auction.auction_id}>
                <h4 className="text-xl font-bold text-purple-700 mb-2">{auction.title}</h4>
                {auction.image_url && (
                  <img src={auction.image_url} alt="Auction"
                    className="w-full h-48 object-cover mb-3 rounded-xl shadow"
                  />
                )}
                <p className="mb-2 text-gray-700">{auction.description}</p>
                <p className="text-green-600 font-bold mb-1">Current Price: ₹{auction.current_price}</p>
                <p className="text-sm text-gray-500 mb-3">Ends at: {new Date(auction.end_time).toLocaleString()}</p>

                <Button color="yellow" onClick={() => {
                  setCurrentAuction(auction)
                  setBidAmount('')
                  setBidModalOpen(true)
                }}>
                  Place Bid
                </Button>

                <h5 className="mt-4 font-semibold text-gray-700">Bid History:</h5>
                <ul className="text-sm max-h-32 overflow-y-auto mt-2 space-y-1">
                  {(bids[auction.auction_id] || []).map(bid => (
                    <li key={bid.bid_id} className="p-2 rounded bg-yellow-50 hover:bg-yellow-100 transition">
                      {bid.bidder_username}: ₹{bid.bid_amount} ({new Date(bid.bid_time).toLocaleTimeString()})
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {bidModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-purple-700">Place Bid for {currentAuction.title}</h3>
            <p className="mb-2 text-gray-700">Current Price: ₹{currentAuction.current_price}</p>

            <Input
              type="number"
              placeholder="Enter your bid"
              value={bidAmount}
              onChange={e => setBidAmount(e.target.value)}
            />

            <div className="mt-4 flex justify-end space-x-3">
              <Button onClick={() => setBidModalOpen(false)} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded-lg shadow transition">Cancel</Button>
              <Button color="green" onClick={async () => {
                if (!bidAmount) return alert('Please enter a bid')
                if (parseFloat(bidAmount) <= parseFloat(currentAuction.current_price)) {
                  return alert('Bid must be higher than current price')
                }

                await supabase.from('bids').insert([{
                  auction_id: currentAuction.auction_id,
                  bidder_username: user,
                  bid_amount: bidAmount
                }])

                await supabase.from('auctions')
                  .update({ current_price: bidAmount })
                  .eq('auction_id', currentAuction.auction_id)

                fetchBidsForAuction(currentAuction.auction_id)

                setBidModalOpen(false)
              }}>
                Submit Bid
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
