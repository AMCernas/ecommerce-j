export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Productos', value: '0', color: 'bg-blue-50' },
          { label: 'Órdenes', value: '0', color: 'bg-green-50' },
          { label: 'Pendientes', value: '0', color: 'bg-yellow-50' },
          { label: 'Ingresos', value: '$0', color: 'bg-purple-50' },
        ].map((stat) => (
          <div key={stat.label} className={`p-6 rounded-xl ${stat.color}`}>
            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
