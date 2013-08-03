'use strict';

describe('Service: orchestratorRunnersAPI', function () {

  // load the service's module
  beforeEach(module('orchestratorServiceManagementApp'));

  // instantiate service
  var orchestratorRunnersAPI;
  beforeEach(inject(function (_orchestratorRunnersAPI_) {
    orchestratorRunnersAPI = _orchestratorRunnersAPI_;
  }));

  it('should do something', function () {
    expect(!!orchestratorRunnersAPI).toBe(true);
  });

});
