import { PieChart, Pie, Tooltip, Cell } from 'recharts';


export default function InvestmentChart({ investment }) {

    const totalValue = investment.reduce((sum, inv) => sum + (inv.amount * inv.unitPrice), 0);
    const colors = ["#39305b", "#674d7e", "#3d4068", "#5a2c5a", "#0d1639", "#003945"];

    const data = investment.map(inv => ({
        name: inv.name,
        value: ((inv.unitPrice * inv.amount) / totalValue) * 100
    }))



    return (

        <PieChart width={300} height={300} >
            <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill='blue'
                stroke='none'

            >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
            </Pie>
            <Tooltip />
        </PieChart >
    )
}