import React, { useState } from 'react';

const CreateNotice = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [ctaOption, setCtaOption] = useState('');
    const [ctaValue, setCtaValue] = useState('');
    const [boost, setBoost] = useState('');

    const ctaOptions = ['Reach Out', 'Join', 'Call', 'DM'];
    const boostOptions = ['Option 1', 'Option 2', 'Option 3']; // Replace with actual options connected to Paystack

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle Paystack payment logic here
        const handler = PaystackPop.setup({
            key: 'your-public-key', // Replace with your Paystack public key
            email: 'customer@email.com', // Replace with customer's email
            amount: 10000, // Replace with actual amount
            currency: 'NGN',
            callback: function(response) {
                // // Payment successful, handle form submission logic here
                // console.log({
                //     title,
                //     description,
                //     startDate,
                //     endDate,
                //     ctaOption,
                //     ctaValue,
                //     boost
                // });
            },
            onClose: function() {
                alert('Payment window closed.');
            }
        });
        handler.openIframe();
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white shadow-md rounded p-1.5">
            <div style={{ marginBottom: '3px'}}>
                <label className="block text-gray-700 text-sm font-bold" style={{ marginBottom: '2px'}}>Notice Title:</label>
                <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    required 
                    className="shadow appearance-none border rounded w-full text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    style={{ padding: '10px'}}
                />
            </div>
            <div style={{ marginBottom: '3px'}}>
                <label className="block text-gray-700 text-sm font-bold" style={{ marginBottom: '2px'}}>Description:</label>
                <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    required 
                    className="shadow appearance-none border rounded w-full text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    style={{ padding: '10px'}}
                />
            </div>
            <div style={{ marginBottom: '3px'}}>
                <label className="block text-gray-700 text-sm font-bold" style={{ marginBottom: '2px'}}>Start Date:</label>
                <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                    required 
                    className="shadow appearance-none border rounded w-full text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    style={{ padding: '10px'}}
                />
            </div>
            <div style={{ marginBottom: '3px'}}>
                <label className="block text-gray-700 text-sm font-bold" style={{ marginBottom: '2px'}}>End Date:</label>
                <input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                    required 
                    className="shadow appearance-none border rounded w-full text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    style={{ padding: '10px'}}
                />
            </div>
            <div style={{ marginBottom: '3px'}}>
                <label className="block text-gray-700 text-sm font-bold" style={{ marginBottom: '2px'}}>Call to Action Option:</label>
                <select 
                    value={ctaOption} 
                    onChange={(e) => setCtaOption(e.target.value)} 
                    required
                    className="shadow appearance-none border rounded w-full text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    style={{ padding: '10px'}}
                >
                    <option value="">Select an option</option>
                    {ctaOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            </div>
            <div style={{ marginBottom: '3px'}}>
                <label className="block text-gray-700 text-sm font-bold" style={{ marginBottom: '2px'}}>Call to Action Value:</label>
                <input 
                    type="text" 
                    value={ctaValue} 
                    onChange={(e) => setCtaValue(e.target.value)} 
                    required 
                    className="shadow appearance-none border rounded w-full text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    style={{ padding: '10px'}}
                />
            </div>
            <div style={{ marginBottom: '3px'}}>
                <label className="block text-gray-700 text-sm font-bold" style={{ marginBottom: '2px'}}>Boost:</label>
                <select 
                    value={boost} 
                    onChange={(e) => setBoost(e.target.value)} 
                    required
                    className="shadow appearance-none border rounded w-full text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    style={{ padding: '10px'}}
                >
                    <option value="">Select an option</option>
                    {boostOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            </div>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold rounded focus:outline-none focus:shadow-outline" style={{ padding: '10px', marginTop: '5px', background: "linear-gradient(to right, purple, var(--primaryColor))"}}>Create Notice</button>
        </form>
    );
};

export default CreateNotice;
