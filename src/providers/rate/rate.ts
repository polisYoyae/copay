import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Logger } from '../../providers/logger/logger';

@Injectable()
export class RateProvider {

  private rates: any;
  private alternatives: any[];
  private ratesPOLIS: any;
  private ratesDASH: any;
  private ratesAvailable: boolean;

  private SAT_TO_BTC: number;
  private BTC_TO_SAT: number;

  private rateServiceUrl = 'https://bitpay.com/api/rates';
  private polisRateServiceUrl = 'https://cors-anywhere.herokuapp.com/api.coinmarketcap.com/v1/ticker/polis';
  private dashRateServiceUrl = 'https://cors-anywhere.herokuapp.com/api.coinmarketcap.com/v1/ticker/dash';


  constructor(
    private http: HttpClient,
    private logger: Logger
  ) {
    this.logger.info('RateProvider initialized.');
    this.rates = {};
    this.alternatives = [];
    this.ratesPOLIS = {};
    this.ratesDASH = {};
    this.SAT_TO_BTC = 1 / 1e8;
    this.BTC_TO_SAT = 1e8;
    this.ratesAvailable = false;
    this.updateRatesBtc();
    this.updateRatesPolis();
    this.updateRatesDash();
  }

  public updateRatesBtc(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getBTC().then((dataBTC: any) => {
        _.each(dataBTC, (currency: any) => {
          this.rates[currency.code] = currency.rate;
          this.alternatives.push({
            name: currency.name,
            isoCode: currency.code,
            rate: currency.rate
          });
        });
        this.ratesAvailable = true;
        resolve();
      }).catch((errorBTC: any) => {
        this.logger.error(errorBTC);
        reject(errorBTC);
      });
    });
  }

  public updateRatesPolis(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getPOLIS().then((dataPOLIS: any) => {
        _.each(dataPOLIS, (currency: any) => {
          this.ratesPOLIS[currency.symbol] = 1;
		  if (this.isAvailable()) {
			_.each(this.alternatives,  (alternative: any) => {
			   this.ratesPOLIS[alternative.isoCode] = currency.price_btc * alternative.rate;
			});
		  }
          this.ratesPOLIS['USD'] = currency.price_usd;
          this.ratesPOLIS['BTC'] = currency.price_btc;
        });


        resolve();
      }).catch((errorPOLIS: any) => {
        this.logger.error(errorPOLIS);
        reject(errorPOLIS);
      });
    });
  }

  public updateRatesDash(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getDASH().then((dataDASH: any) => {
        _.each(dataDASH, (currency: any) => {
          this.ratesDASH[currency.symbol] = 1;
		  if (this.isAvailable()) {
			_.each(this.alternatives,  (alternative: any) => {
			   this.ratesDASH[alternative.isoCode] = currency.price_btc * alternative.rate;
			});
		  }
          this.ratesDASH['USD'] = currency.price_usd;
          this.ratesDASH['BTC'] = currency.price_btc;
        });


        resolve();
      }).catch((errorDASH: any) => {
        this.logger.error(errorDASH);
        reject(errorDASH);
      });
    });
  }

  public getBTC(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.rateServiceUrl).subscribe((data: any) => {
        resolve(data);
      });
    });
  }

  public getPOLIS(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.polisRateServiceUrl).subscribe((data: any) => {
        resolve(data);
      });
    });
  }
  public getDASH(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(this.dashRateServiceUrl).subscribe((data: any) => {
        resolve(data);
      });
    });
  }

  public getRate(code: string, chain?: string): number {
    if (chain == 'polis')
      return this.ratesPOLIS[code];
    else if (chain == 'dash')
        return this.ratesDASH[code];
    else
      return this.rates[code];
  }

  public getAlternatives(): any[] {
    return this.alternatives;
  }

  public isAvailable() {
    return this.ratesAvailable;
  }

  public toFiat(satoshis: number, code: string, chain: string): number {
    if (!this.isAvailable()) {
      return null;
    }
    return satoshis * this.SAT_TO_BTC * this.getRate(code, chain);
  }

  public fromFiat(amount: number, code: string, chain: string): number {
    if (!this.isAvailable()) {
      return null;
    }
    return amount / this.getRate(code, chain) * this.BTC_TO_SAT;
  }

  public listAlternatives(sort: boolean) {
    let alternatives = _.map(this.getAlternatives(), (item: any) => {
      return {
        name: item.name,
        isoCode: item.isoCode
      }
    });
    if (sort) {
      alternatives.sort((a: any, b: any) => {
        return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
      });
    }
    return _.uniqBy(alternatives, 'isoCode');
  }

  public whenRatesAvailable(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.ratesAvailable) resolve();
      else {
        this.updateRatesBtc().then(() => {
          resolve();
        });
      }
    });
  }

}
