import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ConverterService,
  COST_CENTER_NORMALIZER,
  COST_CENTERS_NORMALIZER,
  BUDGETS_NORMALIZER,
} from '@spartacus/core';
import { OccEndpointsService } from '../../services/occ-endpoints.service';
import { OccCostCenterAdapter } from './occ-cost-center.adapter';

import createSpy = jasmine.createSpy;

const costCenterCode = 'testCode';
const budgetCode = 'budgetCode';
const userId = 'userId';
const costCenter = {
  code: costCenterCode,
  name: 'testCostCenter',
};

const budget = {
  code: budgetCode,
};
class MockOccEndpointsService {
  getUrl = createSpy('MockOccEndpointsService.getEndpoint').and.callFake(
    // tslint:disable-next-line:no-shadowed-variable
    (url, { costCenterCode }) =>
      url === 'costCenter' ? url + costCenterCode : url
  );
}

describe('OccCostCenterAdapter', () => {
  let service: OccCostCenterAdapter;
  let httpMock: HttpTestingController;

  let converterService: ConverterService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        OccCostCenterAdapter,
        {
          provide: OccEndpointsService,
          useClass: MockOccEndpointsService,
        },
      ],
    });
    converterService = TestBed.get(ConverterService as Type<ConverterService>);
    service = TestBed.get(OccCostCenterAdapter as Type<OccCostCenterAdapter>);
    httpMock = TestBed.get(
      HttpTestingController as Type<HttpTestingController>
    );
    spyOn(converterService, 'pipeable').and.callThrough();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('load costCenter details', () => {
    it('should load costCenter details for given costCenter code', () => {
      service.load(userId, costCenterCode).subscribe();
      const mockReq = httpMock.expectOne(
        (req) =>
          req.method === 'GET' && req.url === 'costCenter' + costCenterCode
      );
      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(costCenter);
      expect(converterService.pipeable).toHaveBeenCalledWith(
        COST_CENTER_NORMALIZER
      );
    });
  });

  describe('load costCenter list', () => {
    it('should load costCenter list', () => {
      service.loadList(userId).subscribe();
      const mockReq = httpMock.expectOne(
        (req) => req.method === 'GET' && req.url === 'costCentersAll'
      );
      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush([costCenter]);
      expect(converterService.pipeable).toHaveBeenCalledWith(
        COST_CENTERS_NORMALIZER
      );
    });
  });

  describe('load active costCenter list', () => {
    it('should load active costCenter list', () => {
      service.loadActiveList(userId).subscribe();
      const mockReq = httpMock.expectOne(
        (req) => req.method === 'GET' && req.url === 'costCenters'
      );
      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      expect(mockReq.request.params.get('fields')).toEqual(
        'DEFAULT,unit(BASIC,addresses(DEFAULT))'
      );
      mockReq.flush([costCenter]);
      expect(converterService.pipeable).toHaveBeenCalledWith(
        COST_CENTERS_NORMALIZER
      );
    });
  });

  describe('create costCenter', () => {
    it('should create costCenter', () => {
      service.create(userId, costCenter).subscribe();
      const mockReq = httpMock.expectOne(
        (req) =>
          req.method === 'POST' &&
          req.url === 'costCenters' &&
          req.body.code === costCenter.code
      );
      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(costCenter);
      expect(converterService.pipeable).toHaveBeenCalledWith(
        COST_CENTER_NORMALIZER
      );
    });
  });

  describe('update costCenter', () => {
    it('should update costCenter', () => {
      service.update(userId, costCenterCode, costCenter).subscribe();
      const mockReq = httpMock.expectOne(
        (req) =>
          req.method === 'PATCH' &&
          req.url === 'costCenter' + costCenterCode &&
          req.body.code === costCenter.code
      );
      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(costCenter);
      expect(converterService.pipeable).toHaveBeenCalledWith(
        COST_CENTER_NORMALIZER
      );
    });
  });

  describe('load budgets list for costCenter', () => {
    it('should load budgets list for costCenter', () => {
      service.loadBudgets(userId, costCenterCode, {}).subscribe();
      const mockReq = httpMock.expectOne(
        (req) => req.method === 'GET' && req.url === 'costCenterBudgets'
      );
      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush([budget]);
      expect(converterService.pipeable).toHaveBeenCalledWith(
        BUDGETS_NORMALIZER
      );
    });
  });

  describe('assignBudget to costCenter', () => {
    it('should assign budget to costCenter', () => {
      service.assignBudget(userId, costCenterCode, budgetCode).subscribe();
      const mockReq = httpMock.expectOne(
        (req) => req.method === 'POST' && req.url === 'costCenterBudgets'
      );
      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush({});
    });
  });

  describe('unassignBudget from costCenter', () => {
    it('should unassign budget from costCenter', () => {
      service.unassignBudget(userId, costCenterCode, budgetCode).subscribe();
      const mockReq = httpMock.expectOne(
        (req) => req.method === 'DELETE' && req.url === 'costCenterBudget'
      );
      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush({});
    });
  });
});
