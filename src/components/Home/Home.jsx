import React, { useState, useEffect } from "react";
import axios from "axios";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

export default function Home() {
  const [firstName, setFirstName] = useState("");
  const [data, setData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [filter, setFilter] = useState({ amount: "" });
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://marakbeyy.github.io/host_api/React.json");
        const fetchedData = response?.data;
        setData(fetchedData);
        setChartData(fetchedData?.transactions);
        setFilteredData(fetchedData?.transactions); // Set initial filteredData
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleInputChangeTransaction = (e) => {
    setFirstName(e.target.value);
  };

  useEffect(() => {
    if (data) {
      const filtered = chartData
        .filter((transaction) => {
          const customer = data?.customers.find((customer) => customer.id === transaction.customer_id);
          return customer?.name.toLowerCase().includes(firstName.toLowerCase());
        })
        .map((transaction) => ({
          name: transaction.date,
          amount: transaction.amount,
        }));
      setFilteredData(filtered);
    }
  }, [firstName, data, chartData]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      setSearchName(value);
    } else {
      setFilter((prevFilter) => ({ ...prevFilter, [name]: value }));
    }
  };

  useEffect(() => {
    if (data) {
      const filtered = chartData.filter((transaction) => {
        const customer = data.customers.find((c) => c.id === transaction.customer_id);
        return (!searchName || (customer && customer.name.toLowerCase().includes(searchName.toLowerCase()))) && (!filter.amount || transaction.amount >= parseFloat(filter.amount));
      });

      setFilteredData(filtered);
    }
  }, [searchName, filter, data, chartData]);

  return (
    <>
      <input className='w-[80%] mx-auto px-4 py-2 rounded-lg mb-8  border border-gray-300  focus:ring-blue-500 focus:border-red-700' type='text' placeholder='Start Writing...' name='name' value={searchName} onChange={handleFilterChange} />
      <table className='w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400'>
        <thead className='text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
          <tr>
            <th scope='col' className='px-6 py-3'>
              Customer Name
            </th>
            <th scope='col' className='px-6 py-3'>
              Date
            </th>
            <th scope='col' className='px-6 py-3'>
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((transaction) => {
              const customer = data.customers.find((c) => c.id === transaction.customer_id);
              return (
                <tr key={transaction.id} className='odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'>
                  <th scope='row' className='px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'>
                    {customer ? customer.name : "Unknown Customer"}
                  </th>
                  <td className='px-6 py-4'>{transaction.date}</td>
                  <td className='px-6 py-4'>{transaction.amount}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={3} className='px-6 py-4 text-center'>
                Loading...
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <h2>User Transaction Data</h2>

      <div className='flex justify-center items-center'>
        <LineChart width={775} height={500} data={filteredData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
          <Line type='monotone' dataKey='amount' stroke='#8884d8' />
          <CartesianGrid stroke='#ccc' strokeDasharray='5 5' />
          <XAxis dataKey='name' />
          <YAxis type='number' domain={[0, 2000]} ticks={[0, 500, 1000, 1500, 2000]} />
          <Tooltip />
        </LineChart>
      </div>
    </>
  );
}
