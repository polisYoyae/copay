import { Injectable } from '@angular/core';

import { Logger } from '../../providers/logger/logger';

import * as BWCBitcoin from 'bitcore-wallet-client';
import * as BWCPolis from 'bitcore-wallet-client-polis';

@Injectable()
export class BwcProvider {
  constructor(
    private logger: Logger
  ) {
    this.logger.info('BwcProvider initialized.');
  }
  public getBitcore(coin?): any {
	if( coin === 'btc'){
	  return BWCBitcoin.Bitcore;
	}else if ( coin === 'polis' ){
	  return BWCPolis.Bitcore;
	}
    return BWCBitcoin.Bitcore;
  }

  public getBitcorePolis(): any { 
    return BWCPolis.Bitcore;
  }
  
  

  public getErrors(): any { // No bitcore connections - just a lib of errors - Polis bitcore has specific errors (InstantSend, ..)
    return BWCPolis.errors;
  }

  public getSJCL(): any { // No bitcore connections - Just a descriptor of crypto words
    return BWCPolis.sjcl;
  }

  public getUtils(coin: string): any {
    if( coin === 'btc' ){
		return BWCBitcoin.Utils();
	}
    return BWCPolis.Utils();
  }
  
  public parseSecretBtc(opts): any {// Bitcore connections
	return BWCBitcoin.parseSecret(opts); 
  }

  public parseSecretPolis(opts): any {
	return BWCPolis.parseSecret(opts); 
  }
  
  public getClient(coin: string, walletData?, opts?): any { // Bitcore connections
    opts = opts || {};

	let bwc = null;
	if( coin === 'btc' ){
		// note opts use `bwsurl` all lowercase;
		bwc = new BWCBitcoin({
		  baseUrl: opts.bwsurl || 'https://bws.bitpay.com/bws/api',
		  verbose: opts.verbose,
		  timeout: 100000,
		  transports: ['polling'],
		});
	}else{
		// note opts use `bwsurl` all lowercase;
		bwc = new BWCPolis({
		  baseUrl: opts.bwsurl || 'https://bws-polis.polispay.org/bws/api',
		  verbose: opts.verbose,
		  timeout: 100000,
		  transports: ['polling'],
		});
	}
	
    if (walletData)
      bwc.import(walletData, opts);
  
    return bwc;
  }

}
