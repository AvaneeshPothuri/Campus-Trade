export default function Button({ children, onClick, color = 'blue' }) {
  const colorClass = {
    blue: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    green: 'bg-gradient-to-r from-green-400 to-emerald-500',
    red: 'bg-gradient-to-r from-red-500 to-pink-500',
    yellow: 'bg-gradient-to-r from-yellow-400 to-orange-500',
  }[color]

  return (
    <button
      onClick={onClick}
      className={`${colorClass} text-white px-4 py-2 rounded-2xl shadow-md hover:scale-105 transform transition`}
    >
      {children}
    </button>
  )
}