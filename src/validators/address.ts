import { FormControl } from '@angular/forms';
import { BwcProvider } from '../providers/bwc/bwc';

export class AddressValidator {

  static bitcore: BwcProvider;

  constructor(bwc: BwcProvider) {
    AddressValidator.bitcore = bwc;
  }

  isValid(control: FormControl): any {

    let b = AddressValidator.bitcore.getBitcore();
    let c = AddressValidator.bitcore.getBitcorePolis();
    let d = AddressValidator.bitcore.getBitcoreDash();


    let URI = b.URI;
    let Address = b.Address;
    let URIPolis = c.URI;
    let AddressPolis = c.Address;
    let URIDash = d.URI;
    let AddressDash = c.Address;

    // Regular url
    if (/^https?:\/\//.test(control.value)) {
      return null;
    }

    // Bip21 uri
    let uri, isAddressValidLivenet, isAddressValidTestnet;
    if (/^bitcoin:/.test(control.value)) {
      let isUriValid = URI.isValid(control.value);
      if (isUriValid) {
        uri = new URI(control.value);
        isAddressValidLivenet = Address.isValid(uri.address.toString(), 'livenet')
        isAddressValidTestnet = Address.isValid(uri.address.toString(), 'testnet')
      }
      if (isUriValid && (isAddressValidLivenet || isAddressValidTestnet)) {
        return null;
      }
    } else if (/^bitcoin:/.test(control.value)) {
      let isUriValid = URIPolis.isValid(control.value);
      if (isUriValid) {
        uri = new URIPolis(control.value);
        isAddressValidLivenet = AddressPolis.isValid(uri.address.toString(), 'livenet')
      }
      if (isUriValid && isAddressValidLivenet) {
        return null;
      }
    }
    else if (/^bitcoin:/.test(control.value)) {
      let isUriValid = URIDash.isValid(control.value);
      if (isUriValid) {
        uri = new URIDash(control.value);
        isAddressValidLivenet = AddressDash.isValid(uri.address.toString(), 'livenet')
      }
      if (isUriValid && isAddressValidLivenet) {
        return null;
      }
    }

    // Regular Address: try Bitcoin and Polis
    let regularAddressLivenet = Address.isValid(control.value, 'livenet');
    let regularAddressTestnet = Address.isValid(control.value, 'testnet');
    let regularAddressPolisLivenet = AddressPolis.isValid(control.value, 'livenet');
    let regularAddressDashLivenet = AddressDash.isValid(control.value, 'livenet');
    if (regularAddressLivenet || regularAddressTestnet || regularAddressPolisLivenet || regularAddressDashLivenet) {
      return null;
    }

    return {
      "Invalid Address": true
    };
  }
}
