import { Injectable } from '@angular/core';

// Providers
import { BwcProvider } from '../../providers/bwc/bwc';

@Injectable()
export class AddressProvider {
  private bitcore: any;
  private bitcorePolis: any;
  private Bitcore: any;

  constructor(
    private bwcProvider: BwcProvider,
  ) {
    this.bitcore = this.bwcProvider.getBitcore();
    this.bitcorePolis = this.bwcProvider.getBitcorePolis();
    this.Bitcore = {
      'btc': {
        lib: this.bitcore,
        translateTo: 'polis'
      },
      'polis': {
        lib: this.bitcorePolis,
        translateTo: 'btc'
      }
    };
  }

  getCoin(address: string) {
    try {
      new this.Bitcore['btc'].lib.Address(address);
      return 'btc';
    } catch (e) {
      try {
        new this.Bitcore['polis'].lib.Address(address);
        return 'polis';
      } catch (e) {
        return null;
      }
    }
  };

  translateAddress(address: string) {
    var origCoin = this.getCoin(address);
    if (!origCoin) return;

    var origAddress = new this.Bitcore[origCoin].lib.Address(address);
    var origObj = origAddress.toObject();

    var resultCoin = this.Bitcore[origCoin].translateTo;
    var resultAddress = this.Bitcore[resultCoin].lib.Address.fromObject(origObj);
    return {
      origCoin,
      origAddress: address,
      resultCoin,
      resultAddress: resultAddress.toString()
    };
  };

  validateAddress(address: string) {
    let Address = this.bitcore.Address;
    let AddressPolis = this.bitcorePolis.Address;
    let isLivenet = Address.isValid(address, 'livenet');
    let isTestnet = Address.isValid(address, 'testnet');
    let isLivenetPolis = AddressPolis.isValid(address, 'livenet');
    return {
      address,
      isValid: isLivenet || isTestnet || isLivenetPolis,
      network: isTestnet ? 'testnet' : 'livenet',
      coin: this.getCoin(address),
      translation: this.translateAddress(address),
    };
  }
}