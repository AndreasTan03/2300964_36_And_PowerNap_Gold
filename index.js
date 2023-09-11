const express = require('express')
const app = express()
const path = require('path')
const db = require('./db/db')

app.use(express.json())

//Rooms database initial value
const runQuery = async () => {
    await db('rooms').insert([
    {room_type: 'Senderan', room_price: 8000},
    {room_type: 'Rebahan', room_price: 17000},
    {room_type: 'Pules Poll', room_price: 45000} 
    ])
}
runQuery()

//AboutUs
app.use(express.static(path.join(__dirname, 'public')));

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'aboutUs.html'));
});

//read
app.get('/rooms', async (req,res) => {
    try {
        const data = await db.select('*').from('rooms')
    
    res.json({
        status: 200,
        data: data
    })
    } catch (error) {
        res.json({
            status : 500,
            message: 'error fetching data from the database'
        })
    } 
})

//create
app.post('/reservation', async (req, res) => {
    try{
        const {first_name, last_name, phone_number, room_type, number_of_rooms, date} = req.body

        // Check if the room_type is valid (you can customize this validation)
        const validRoomTypes = ['Senderan', 'Rebahan', 'Pules Poll']; // Add valid room types here
        if (!validRoomTypes.includes(room_type)) {
            return res.status(400).json({ status: 400, message: 'Invalid room type' })
        }

        // Check if the booking date is in the future
        const currentDate = new Date()
        const bookingDate = new Date(date)

        if (bookingDate <= currentDate) {
            return res.status(400).json({ status: 400, message: 'Booking date must be in the future' })
        }

         // Retrieve the room price from the "rooms" database based on the room_type
         const roomPriceData = await db.select('room_price').from('rooms').where('room_type', room_type).first();

         if (!roomPriceData) {
             return res.status(404).json({ status: 404, message: 'Room type not found' });
         }
 
         const roomPrice = roomPriceData.room_price;
 
         // Calculate the order price based on the retrieved room price and number of rooms
         const orderPrice = roomPrice * number_of_rooms;

        // Insert the reservation into the database
        const [reservation_number] = await db('reservations').insert({
            first_name: first_name,
            last_name: last_name,
            phone_number: phone_number,
            room_type: room_type,
            number_of_rooms: number_of_rooms,
            booking_for: date,
            order_price: orderPrice,
        }).returning('reservation_number'); // Return the reservation number


        res.status(201).json({
            status: 201, 
            message: 'reservation successfully made',
            reservation_number: reservation_number,
            first_name: first_name,
            last_name: last_name,
            room_type: room_type,
            booking_for: date,
            order_price: orderPrice,
        })

    } catch (error) {
        res.json({
            status : 500,
            message: error.message
        });
    }
})

//update
app.put('/reservation/:reservation_number', async (req, res) => {
    try {
        const { reservation_number } = req.params;
        const { room_type, number_of_rooms, date } = req.body;

        // Check if the reservation with the specified reservation_number exists
        const existingReservation = await db('reservations')
            .select('*')
            .where('reservation_number', reservation_number)
            .first();

        if (!existingReservation) {
            return res.status(404).json({ status: 404, message: 'Reservation not found' });
        }

        // Validate and update the reservation details
        if (room_type) {
            // Check if the room_type is valid (you can customize this validation)
            const validRoomTypes = ['Senderan', 'Rebahan', 'Pules Poll']; // Add valid room types here
            if (!validRoomTypes.includes(room_type)) {
                return res.status(400).json({ status: 400, message: 'Invalid room type' });
            }
        }

        if (date) {
            // Check if the new booking date is in the future
            const currentDate = new Date();
            const bookingDate = new Date(date);

            if (bookingDate <= currentDate) {
                return res.status(400).json({ status: 400, message: 'Booking date must be in the future' });
            }
        }

        // Calculate the updated order price if room type or number of rooms is changed
        let updatedOrderPrice = existingReservation.order_price;
        if (room_type || number_of_rooms) {
            // Retrieve the room price from the "rooms" database based on the new room_type
            const roomPriceData = await db.select('room_price').from('rooms').where('room_type', room_type).first();

            if (!roomPriceData) {
                return res.status(404).json({ status: 404, message: 'Room type not found' });
            }

            const newRoomPrice = roomPriceData.room_price;
            const newNumberOfRooms = number_of_rooms || existingReservation.number_of_rooms;

            updatedOrderPrice = newRoomPrice * newNumberOfRooms;
        }

        // Update the reservation details in the database
        await db('reservations')
            .where('reservation_number', reservation_number)
            .update({
                room_type: room_type || existingReservation.room_type,
                number_of_rooms: number_of_rooms || existingReservation.number_of_rooms,
                booking_for: date || existingReservation.booking_for,
                order_price: updatedOrderPrice,
            });

        res.status(200).json({ status: 200, message: 'Reservation updated successfully' });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Internal server error' });
    }
});

//delete
app.delete('/reservation/:reservation_number', async (req, res) => {
    try {
        const { reservation_number } = req.params;

        // Check if the reservation with the specified reservation_number exists
        const existingReservation = await db('reservations')
            .select('*')
            .where('reservation_number', reservation_number)
            .first();

        if (!existingReservation) {
            return res.status(404).json({ status: 404, message: 'Reservation not found' });
        }

        // Delete the reservation from the database
        await db('reservations')
            .where('reservation_number', reservation_number)
            .del();

        res.status(200).json({ status: 200, message: 'Reservation deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Internal server error' });
    }
});

app.listen(3000, () => {
    console.log('listening on port 3000');
})