const mongoose = require('mongoose');
const paymentSchema = new mongoose.Schema({
    "amount": {
        type:Number,
        required:true
    },
    "amount_due":  {
        type:Number,
        required:true
    },
    "amount_paid":  {
        type:Number,
        required:true
    },
    "paymentMode":{
        type:String,
    },
    "attempts":  {
        type:Number,
        required:false
    },
    "created_at": {
        type:String,
        required:false
    },
    "currency": {
        type:String,
        required:true
    },
    "entity": {
        type:String,
        required:false
    },
    "order_id": {
        type:String,
        required:false
    },
    "notes": [],
    "offer_id": {
        type:String,
        required:false
    },
    "receipt": {
        type:String,
        required:false
    },
    "status": {
        type:String,
        required:false
    },
    "user_id":{
        type:String,
        required:false
    },
    "payment_gateway":{
        type:String,
        required:true
    },
    invoice_id:{
        type:String,
        required:false
    },
    international:{
        type:Boolean,
        required:false
    },
    method:{
        type:String,
        required:false
    },
    amount_refunded:{
        type:Number,
        required:false
    },
    refund_status:{
        type:String,
        required:false
    },
    captured:{
        type:Boolean,
        required:false
    },
    description:{
        type:String,
        required:false
    },
    card_id:{
        type:String,
        required:false
    },
    card:{},
    "bank": {
        type:String,
        required:false
    },
    "wallet": {
        type:String,
        required:false
    },
    "vpa": {
        type:String,
        required:false
    },
    "email": {
        type:String,
        required:false
    },
    "contact":{
        type:String,
        required:false
    },
    name:{
        type:String,
        required:false
    },
    "fee": {
        type:Number,
        required:false
    },
    "tax": {
        type:Number,
        required:false
    },
    "error_code": {
        type:String,
        required:false
    },
    "error_description": {
        type:String,
        required:false
    },
    "error_source": {
        type:String,
        required:false
    },
    "error_step": {
        type:String,
        required:false
    },
    "error_reason": {
        type:String,
        required:false
    },
    "acquirer_data": {
    },
    razorpay_payment_id:{
        type:String,
        required:false
    },
    razorpay_order_id:{
        type:String,
        required:false
    },
    razorpay_signature:{
        type:String,
        required:false
    }
    },
    {
        versionKey : false
    });
module.exports = mongoose.model('PaymentOrders', paymentSchema);
