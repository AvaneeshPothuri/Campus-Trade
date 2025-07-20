export default function Card({ children }) {
  return (
    <div className="bg-white shadow-lg rounded-2xl p-4 hover:shadow-xl transition">
      {children}
    </div>
  )
}