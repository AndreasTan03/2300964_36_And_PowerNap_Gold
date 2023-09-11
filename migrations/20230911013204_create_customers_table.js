/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('rooms', (table) => {
        table.increments('room_id')
        table.string('room_type')
        table.integer('room_price')

    })
    
    .createTable('reservations', (table) => {
        table.bigIncrements('reservation_number')
        table.string('first_name', 255).notNullable()
        table.string('last_name', 255).notNullable()
        table.varchar('phone_number',20)
        table.string('room_type')
        table.integer('number_of_rooms')
        table.integer('order_price')
        table.date('booking_for')
        table.timestamp('timestamp').defaultTo(knex.fn.now())
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('rooms')
    .dropTable('reservations')

};
