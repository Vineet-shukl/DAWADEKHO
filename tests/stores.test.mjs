import test from 'node:test';
import assert from 'node:assert/strict';
import { mapKendra, statesNear, phoneOf, daysOf } from '../api/stores.js';

test('Lucknow matches the Uttar Pradesh list code', () => {
  assert.ok(statesNear(26.8467, 80.9462).includes(9));
});

test('central Delhi matches the Delhi list code', () => {
  assert.ok(statesNear(28.6139, 77.209).includes(7));
});

test('a blank contact number stays blank', () => {
  assert.equal(phoneOf({ contactNumber: '' }), '');
  assert.equal(phoneOf({ contactNumber: 'null' }), '');
  assert.equal(phoneOf({}), '');
  const shops = mapKendra(
    [
      {
        status: 1,
        storeCode: 'PMBJK1',
        kendraAddress: 'Station Road',
        districtName: 'Lucknow',
        stateName: 'Uttar Pradesh',
        latitude: '26.85',
        longitude: '80.95',
        contactNumber: '',
      },
    ],
    26.8467,
    80.9462
  );
  assert.equal(shops.length, 1);
  assert.equal(shops[0].phone, '');
  assert.equal(shops[0].days, '');
  assert.equal(shops[0].name, 'Jan Aushadhi PMBJK1');
  assert.match(shops[0].maps, /destination=26\.85,80\.95/);
});

test('keeps a phone and open days only when the record has them', () => {
  assert.equal(daysOf({}), '');
  const shops = mapKendra(
    [
      {
        status: 1,
        storeCode: 'PMBJK2',
        latitude: '26.85',
        longitude: '80.95',
        contactNumber: '9876543210',
        openDays: 'Mon to Sat',
      },
    ],
    26.8467,
    80.9462
  );
  assert.equal(shops[0].phone, '9876543210');
  assert.equal(shops[0].days, 'Mon to Sat');
});

test('drops inactive shops and shops farther than 25 km', () => {
  const shops = mapKendra(
    [
      { status: 0, storeCode: 'OFF', latitude: '26.85', longitude: '80.95', contactNumber: '9876543210' },
      { status: 1, storeCode: 'FAR', latitude: '13.0', longitude: '77.6' },
      { status: 1, storeCode: 'ZERO', latitude: '0', longitude: '0' },
    ],
    26.8467,
    80.9462
  );
  assert.equal(shops.length, 0);
});
