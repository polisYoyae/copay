import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Logger } from '../../providers/logger/logger';

// providers
import { AddressBookProvider } from '../../providers/address-book/address-book';
import { AddressProvider } from '../../providers/address/address';
import { IncomingDataProvider } from '../../providers/incoming-data/incoming-data';
import { PopupProvider } from '../../providers/popup/popup';
import { ProfileProvider } from '../../providers/profile/profile';
import { WalletProvider } from '../../providers/wallet/wallet';

// pages
import { AmountPage } from './amount/amount';

import * as _ from 'lodash';

@Component({
  selector: 'page-send',
  templateUrl: 'send.html',
})
export class SendPage {
  public search: string = '';
  
  public walletsBtc: any;
  public walletBtcList: any;
  public hasBtcWallets: boolean;
  
  public walletsPolis: any;
  public walletPolisList: any;
  public hasPolisWallets: boolean;
  
  public walletsDash: any;
  public walletDashList: any;
  public hasDashWallets: boolean;
  
  public contactsList: object[] = [];
  public filteredContactsList: object[] = [];
  public hasContacts: boolean;
  public contactsShowMore: boolean;
  private CONTACTS_SHOW_LIMIT: number = 10;
  private currentContactsPage: number = 0;

  constructor(
    private navCtrl: NavController,
    private profileProvider: ProfileProvider,
    private walletProvider: WalletProvider,
    private addressBookProvider: AddressBookProvider,
    private logger: Logger,
    private incomingDataProvider: IncomingDataProvider,
    private popupProvider: PopupProvider,
    private addressProvider: AddressProvider
  ) { }

  ionViewDidLoad() {
    this.logger.info('ionViewDidLoad SendPage');
  }

  ionViewWillEnter() {
    this.walletsBtc = this.profileProvider.getWallets({ coin: 'btc' });
    this.walletsPolis = this.profileProvider.getWallets({ coin: 'polis' });
    this.walletsDash = this.profileProvider.getWallets({ coin: 'dash' });
    this.hasBtcWallets = !(_.isEmpty(this.walletsBtc));
    this.hasPolisWallets = !(_.isEmpty(this.walletsPolis));
    this.hasDashWallets = !(_.isEmpty(this.walletsDash));
    this.updatePolisWalletsList();
    this.updateDashWalletsList();
    this.updateBtcWalletsList();
    this.updateContactsList();
  }

  ionViewDidEnter() {
    this.search = '';
  }

  private updatePolisWalletsList(): void {
    this.walletPolisList = [];

    if (!this.hasPolisWallets) return;

    _.each(this.walletsPolis, (v: any) => {
      this.walletPolisList.push({
        color: v.color,
        name: v.name,
        recipientType: 'wallet',
        coin: v.coin,
        network: v.network,
        m: v.credentials.m,
        n: v.credentials.n,
        isComplete: v.isComplete(),
        needsBackup: v.needsBackup,
        getAddress: (): Promise<any> => {
          return new Promise((resolve, reject) => {
            this.walletProvider.getAddress(v, false).then((addr) => {
              return resolve(addr);
            }).catch((err) => {
              return reject(err);
            });
          });
        }
      });
    });
  }

  private updateDashWalletsList(): void {
    this.walletDashList = [];

    if (!this.hasDashWallets) return;

    _.each(this.walletsDash, (v: any) => {
      this.walletDashList.push({
        color: v.color,
        name: v.name,
        recipientType: 'wallet',
        coin: v.coin,
        network: v.network,
        m: v.credentials.m,
        n: v.credentials.n,
        isComplete: v.isComplete(),
        needsBackup: v.needsBackup,
        getAddress: (): Promise<any> => {
          return new Promise((resolve, reject) => {
            this.walletProvider.getAddress(v, false).then((addr) => {
              return resolve(addr);
            }).catch((err) => {
              return reject(err);
            });
          });
        }
      });
    });
  }

  private updateBtcWalletsList(): void {
    this.walletBtcList = [];

    if (!this.hasBtcWallets) return;

    _.each(this.walletsBtc, (v: any) => {
      this.walletBtcList.push({
        color: v.color,
        name: v.name,
        recipientType: 'wallet',
        coin: v.coin,
        network: v.network,
        m: v.credentials.m,
        n: v.credentials.n,
        isComplete: v.isComplete(),
        needsBackup: v.needsBackup,
        getAddress: (): Promise<any> => {
          return new Promise((resolve, reject) => {
            this.walletProvider.getAddress(v, false).then((addr) => {
              return resolve(addr);
            }).catch((err) => {
              return reject(err);
            });
          });
        }
      });
    });
  }

  private updateContactsList(): void {
    this.addressBookProvider.list().then((ab: any) => {

      this.hasContacts = _.isEmpty(ab) ? false : true;
      if (!this.hasContacts) return;

      this.contactsList = [];
      _.each(ab, (v: any, k: string) => {
        this.contactsList.push({
          name: _.isObject(v) ? v.name : v,
          address: k,
          network: this.addressProvider.validateAddress(k).network,
          email: _.isObject(v) ? v.email : null,
          recipientType: 'contact',
          coin: this.addressProvider.validateAddress(k).coin,
          getAddress: (): Promise<any> => {
            return new Promise((resolve, reject) => {
              return resolve(k);
            });
          }
        });
      });
      let shortContactsList = _.clone(this.contactsList.slice(0, (this.currentContactsPage + 1) * this.CONTACTS_SHOW_LIMIT));
      this.filteredContactsList = _.clone(shortContactsList);
      this.contactsShowMore = this.contactsList.length > shortContactsList.length;
    });
  }

  public showMore(): void {
    this.currentContactsPage++;
    this.updateContactsList();
  }

  public openScanner(): void {
    this.navCtrl.parent.select(2);
  }

  public findContact(search: string): void {
    if (this.incomingDataProvider.redir(search)) return;
    if (search && search.trim() != '') {
      let result = _.filter(this.contactsList, (item: any) => {
        let val = item.name;
        return _.includes(val.toLowerCase(), search.toLowerCase());
      });
      this.filteredContactsList = result;
    } else {
      this.updateContactsList();
    }
  }

  public goToAmount(item: any): void {
    item.getAddress().then((addr: string) => {
      if (!addr) {
        // Error is already formated
        this.popupProvider.ionicAlert('Error - no address');
        return;
      }
      this.logger.debug('Got address:' + addr + ' | ' + item.name);
      this.navCtrl.push(AmountPage, {
        recipientType: item.recipientType,
        toAddress: addr,
        name: item.name,
        email: item.email,
        color: item.color,
        coin: item.coin,
        network: item.network,
      });
      return;
    }).catch((err: any) => {
      this.logger.warn(err);
    });
  };
}
