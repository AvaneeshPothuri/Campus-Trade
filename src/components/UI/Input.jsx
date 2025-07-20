export default function Input({ ...props }) {
  return (
    <input
      {...props}
      className="w-full p-3 mb-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
    />
  )
}