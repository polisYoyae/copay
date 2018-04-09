/* tslint:disable */
import { TestBed, getTestBed, inject, async } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RateProvider } from './rate';
import { Logger } from '../../providers/logger/logger';
import {
  TranslateModule,
  TranslateService,
  TranslateLoader,
  TranslateFakeLoader
} from '@ngx-translate/core';

describe('RateProvider', () => {
  let injector: TestBed;
  let service: RateProvider;
  let httpMock: HttpTestingController;

  const btcResponse = [{"code":"BTC","name":"Bitcoin","rate":1},{"code":"USD","name":"US Dollar","rate":11535.74},{"code":"POLIS","name":"Polis","rate":7.65734},{"code":"DASH","name":"Dash","rate":7.65734}];
  const polisResponse = [{"symbol":"POLIS","name":"Polis","price_btc":0.130377,"price_usd":1503.3}];
  const dashResponse = [{"symbol":"DASH","name":"Dash","price_btc":0.130377,"price_usd":1503.3}];
  let btcUrl: string = 'https://bitpay.com/api/rates';
  let polisUrl: string = 'https://api.coinmarketcap.com/v1/ticker/polis';
  let dashUrl: string = 'https://api.coinmarketcap.com/v1/ticker/dash';


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })
      ],
      providers: [
        RateProvider,
        Logger
      ]
    });
    injector = getTestBed();
    service = injector.get(RateProvider);
    httpMock = injector.get(HttpTestingController);
  });

  it('should see if rates are available', () => {
    service.updateRatesBtc().then(response => {
      expect(service.isAvailable()).toBe(true);
    });

    httpMock.match(btcUrl)[1].flush(btcResponse);
    httpMock.match(polisUrl)[0].flush(polisResponse);
    httpMock.match(dashUrl)[0].flush(dashResponse);
    httpMock.verify();
  });

  it('should get BTC rates', () => {
    service.updateRatesBtc().then(response => {
      expect(service.isAvailable()).toBe(true);
      expect(service.getRate('BTC')).toEqual(1);
      expect(service.getRate('USD')).toEqual(11535.74);
      expect(service.getRate('POLIS')).toEqual(7.65734);
      expect(service.getRate('DASH')).toEqual(7.65734);
    });

    httpMock.match(btcUrl)[1].flush(btcResponse);
    httpMock.match(polisUrl)[0].flush(polisResponse);
    httpMock.match(dashUrl)[0].flush(dashResponse);
    httpMock.verify();
  });

  it('should get POLIS rates', () => {
    service.updateRatesPolis().then(response => {
      expect(service.isAvailable()).toBe(true);
      expect(service.getRate('BTC', 'polis')).toEqual(0.130377);
      expect(service.getRate('USD', 'polis')).toEqual(1503.3);
      expect(service.getRate('POLIS', 'polis')).toEqual(1);
    });

    httpMock.match(btcUrl)[0].flush(btcResponse);
    httpMock.match(polisUrl)[1].flush(polisResponse);
    httpMock.verify();
  });

  it('should get DASH rates', () => {
    service.updateRatesDash().then(response => {
      expect(service.isAvailable()).toBe(true);
      expect(service.getRate('BTC', 'dash')).toEqual(0.130377);
      expect(service.getRate('USD', 'dash')).toEqual(1503.3);
      expect(service.getRate('DASH', 'dash')).toEqual(1);
    });

    httpMock.match(btcUrl)[0].flush(btcResponse);
    httpMock.match(dashUrl)[1].flush(dashResponse);
    httpMock.verify();
  });

  it('should catch an error on when call to update btc rates fails', () => {
    service.getPOLIS = (): Promise<any> => {
      let prom = new Promise((resolve, reject) => {
        reject('test rejection');
      });
      return prom;
    };

    service.updateRatesPolis()
    .catch((err: any) => {
      expect(err).not.toBeNull();
    });
  });

  it('should catch an error on when call to update btc rates fails', () => {
    service.getDASH = (): Promise<any> => {
      let prom = new Promise((resolve, reject) => {
        reject('test rejection');
      });
      return prom;
    };

    service.updateRatesDash()
    .catch((err: any) => {
      expect(err).not.toBeNull();
    });
  });

  it('should catch an error on when call to update polis rates fails', () => {
    service.getBTC = (): Promise<any> => {
      let prom = new Promise((resolve, reject) => {
        reject('test rejection');
      });
      return prom;
    };

    service.updateRatesBtc()
    .catch((err: any) => {
      expect(err).not.toBeNull();
    });
  });

  it('should covert POLIS satoshis to fiat', () => {
    // before we have rates
    expect(service.toFiat(0.25*1e+8, 'USD', 'polis')).toBeNull();

    // after we have rates
    service.updateRatesPolis().then(response => {
      expect(service.isAvailable()).toBe(true);
      expect(service.toFiat(1*1e+8, 'USD', 'polis')).toEqual(1503.3);
      expect(service.toFiat(0.5*1e+8, 'USD', 'polis')).toEqual(751.65);
      expect(service.toFiat(0.25*1e+8, 'USD', 'polis')).toEqual(375.825);
    });

    httpMock.match(btcUrl)[0].flush(btcResponse);
    httpMock.match(polisUrl)[1].flush(polisResponse);
    httpMock.verify();
  });

  it('should covert DASH satoshis to fiat', () => {
    // before we have rates
    expect(service.toFiat(0.25*1e+8, 'USD', 'dash')).toBeNull();

    // after we have rates
    service.updateRatesDash().then(response => {
      expect(service.isAvailable()).toBe(true);
      expect(service.toFiat(1*1e+8, 'USD', 'dash')).toEqual(1503.3);
      expect(service.toFiat(0.5*1e+8, 'USD', 'dash')).toEqual(751.65);
      expect(service.toFiat(0.25*1e+8, 'USD', 'dash')).toEqual(375.825);
    });

    httpMock.match(btcUrl)[0].flush(btcResponse);
    httpMock.match(dashUrl)[1].flush(pdashResponse);
    httpMock.verify();
  });

  it('should covert fiat to POLIS satoshis', () => {
    // before we have rates
    expect(service.fromFiat(0.25*1e+8, 'USD', 'polis')).toBeNull();

    // after we have rates
    service.updateRatesPolis().then(response => {
      expect(service.isAvailable()).toBe(true);
      expect(service.fromFiat(1503.3, 'USD', 'polis')).toEqual(1*1e+8);
      expect(service.fromFiat(751.65, 'USD', 'polis')).toEqual(0.5*1e+8);
      expect(service.fromFiat(375.825, 'USD', 'polis')).toEqual(0.25*1e+8);
    });

    httpMock.match(btcUrl)[0].flush(btcResponse);
    httpMock.match(polisUrl)[1].flush(polisResponse);
    httpMock.verify();
  });

  it('should covert fiat to DASH satoshis', () => {
    // before we have rates
    expect(service.fromFiat(0.25*1e+8, 'USD', 'dash')).toBeNull();

    // after we have rates
    service.updateRatesDash().then(response => {
      expect(service.isAvailable()).toBe(true);
      expect(service.fromFiat(1503.3, 'USD', 'dash')).toEqual(1*1e+8);
      expect(service.fromFiat(751.65, 'USD', 'dash')).toEqual(0.5*1e+8);
      expect(service.fromFiat(375.825, 'USD', 'dash')).toEqual(0.25*1e+8);
    });

    httpMock.match(btcUrl)[0].flush(btcResponse);
    httpMock.match(dashUrl)[1].flush(dashResponse);
    httpMock.verify();
  });

  it('should covert BTC satoshis to fiat', () => {
    // before we have rates
    expect(service.toFiat(0.25*1e+8, 'USD', 'btc')).toBeNull();

    // after we have rates
    service.updateRatesBtc().then(response => {
      expect(service.isAvailable()).toBe(true);
      expect(service.toFiat(1*1e+8, 'USD', 'btc')).toEqual(11535.74);
      expect(service.toFiat(0.5*1e+8, 'USD', 'btc')).toEqual(5767.87);
      expect(service.toFiat(0.25*1e+8, 'USD', 'btc')).toEqual(2883.935);
    });

    httpMock.match(btcUrl)[1].flush(btcResponse);
    httpMock.match(polisUrl)[0].flush(polisResponse);
    httpMock.match(dashUrl)[0].flush(dashResponse);
    httpMock.verify();
  });

  it('should covert fiat to BTC satoshis', () => {
    // before we have rates
    expect(service.fromFiat(0.25*1e+8, 'USD', 'btc')).toBeNull();

    // after we have rates
    service.updateRatesBtc().then(response => {
      expect(service.isAvailable()).toBe(true);
      expect(service.fromFiat(11535.74, 'USD', 'btc')).toEqual(1*1e+8);
      expect(service.fromFiat(5767.87, 'USD', 'btc')).toEqual(0.5*1e+8);
      expect(service.fromFiat(2883.935, 'USD', 'btc')).toEqual(0.25*1e+8);
    });

    httpMock.match(btcUrl)[1].flush(btcResponse);
    httpMock.match(polisUrl)[0].flush(polisResponse);
    httpMock.match(dashUrl)[0].flush(dashResponse);
    httpMock.verify();
  });

  it('should list alternatives', () => {
    // before we have rates
    expect(service.listAlternatives(false)).toEqual([]);
    expect(service.listAlternatives(true)).toEqual([]);

    // after we have rates
    service.updateRatesBtc().then(response => {
      expect(service.isAvailable()).toBe(true);
      expect(service.listAlternatives(false)).toEqual([
        {name: 'Bitcoin', isoCode: 'BTC'},
        {name: 'US Dollar', isoCode: 'USD'}
      ]);
      expect(service.listAlternatives(true)).toEqual([
        {name: 'Bitcoin', isoCode: 'BTC'},
        {name: 'US Dollar', isoCode: 'USD'}
      ]);
    });

    httpMock.match(btcUrl)[1].flush(btcResponse);
    httpMock.match(polisUrl)[0].flush(polisResponse);
    httpMock.match(dashUrl)[0].flush(dashResponse);
    httpMock.verify();
  });

  it('should resolve when rates are available', () => {
    // before we have rates
    expect(service.isAvailable()).toBe(false);

    service.whenRatesAvailable().then(response => {
      // after we have rates
      expect(service.isAvailable()).toBe(true);

      // hit the if in whenRatesAvailable
      service.whenRatesAvailable();
    });

    httpMock.match(btcUrl)[1].flush(btcResponse);
    httpMock.match(polisUrl)[0].flush(polisResponse);
    httpMock.match(dashUrl)[0].flush(dashResponse);
    httpMock.verify();
  });
});
