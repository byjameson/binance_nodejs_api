

const Binance = require('node-binance-api');

const { spawn } = require('child_process');
const axios = require('axios').default;


let bought;
let leverage = 10;
let api1;
let api2;
let binance;
let buyAmount;
let buy;
let signals;
let initialMargin;
let db;
let symbol;
let dec;
let priceCekilen;
let balanceCekilen;
let futuresAccount;
let totalUsd;
let beforeSymbol;



bought = 0;
boughtType = 0;

api1 = "KEY";
api2 = "SECRET";

init = async () => {
connectBinance(api1,api2);

}

config = async () => {
  await binance.futuresLeverage( symbol, leverage );
  await binance.futuresMarginType( symbol, 'ISOLATED' );
}


connectBinance = async (api1,api2) => {

  binance = new Binance().options({
    APIKEY: api1,
    APISECRET: api2
  });


  setInterval(function () {
    check();
  }, 10000);
}


function check(){
  if(bought==0){
  symbol = "AA";
  }

  axios({
     method: 'get',
     url: 'URL TO GET SIGNAL/bot/get.php',
     params: {
   qparam: symbol
     }
   }).then(obj => {
   dec =   obj.data.split("-");
   signals = dec[0];
   priceCekilen = dec[1];
   balanceCekilen = dec[2];
   symbol = dec[2];
   if(symbol!=beforeSymbol){
   config();
   }
   });
   buy = 0;
beforeSymbol = symbol;

   if(signals!=undefined){
   buyAndSell(buy,signals,priceCekilen,balanceCekilen);
}
}


buyAndSell = async (buy,signals,priceCekilen,balanceCekilen) => {
await step1(step2);
}




long = async (buyAmount, reduceOnly=0) => {

buyAmount = buyAmount.toLocaleString(5);
if(buyAmount.indexOf(",")!=-1){
  buyAmount = buyAmount.replace(',', '');

}

  if(reduceOnly==1){

await binance.futuresMarketBuy( symbol, buyAmount, {reduceOnly: true} );
await binance.futuresMarketBuy( symbol, buyAmount, {reduceOnly: true} );
  }else{
await binance.futuresMarketBuy( symbol, buyAmount );

  }
}

short = async (sellAmount, reduceOnly=0) => {
  sellAmount = sellAmount.toLocaleString(5);
  if(sellAmount.indexOf(",")!=-1){
    sellAmount = sellAmount.replace(',', '');

  }

if(reduceOnly==1){

await binance.futuresMarketSell( symbol, sellAmount, {reduceOnly: true} );
await binance.futuresMarketSell( symbol, sellAmount, {reduceOnly: true} );



  }else{
await binance.futuresMarketSell( symbol, sellAmount );

}


}

buyBefore = async (type) => {


 futuresAccount = await binance.futuresAccount();

 for(x=0;x<futuresAccount.positions.length;x++){
   if(futuresAccount.positions[x].symbol==symbol){

     initialMargin = futuresAccount.positions[x].positionAmt;
   }
 }
 if(initialMargin<0){
   initialMargin = initialMargin*-1;
 }

 if(initialMargin<10){

   futuresAccount = await binance.futuresAccount();

   totalUsd = futuresAccount.totalWalletBalance;

   totalUsd = totalUsd * leverage;
   ls = spawn('php', ['calc.php', totalUsd,symbol,priceCekilen,balanceCekilen]);
   ls.stdout.on('data', (data) => {

   buyAmount = `${data}`;
   if(type=="long"){
   long(buyAmount);
 }
 if(type=="short"){
   short(buyAmount);
 }
   });
 }


}

async function step1(callback1){

let cix = 0;
let buyInterval;


if(bought==0 && signals=="long"){

buyInterval = setInterval(function(){
 buyBefore("long");
 cix++;

if(cix>=3){
 clearInterval(buyInterval);
}

}, 2000);

 bought = 1;
 boughtType = "long";
  }
  if(bought==0 && signals=="short"){

   buyInterval = setInterval(function(){
     buyBefore("short");
     cix++;

   if(cix>=3){
     clearInterval(buyInterval);
   }

   }, 2000);

    bought = 1;
    boughtType = "short";
  }

  callback1();



}






async function step2(callback2){

  if(signals=="0" && bought==1){
   let cix = 0;

   buyInterval = setInterval(async function(){
     futuresAccount = await binance.futuresAccount();
     for(x=0;x<futuresAccount.positions.length;x++){
       if(futuresAccount.positions[x].symbol==symbol){

         initialMargin = futuresAccount.positions[x].positionAmt;
       }
     }
     if(initialMargin<0){
      long(initialMargin*-1, 1);

     }else{
      short(initialMargin, 1);
    }

    cix++;

   if(cix>=3){
     clearInterval(buyInterval);
   }

   }, 2000);

bought = 0;
boughtType = 0;

  }






}








init();
