'use strict';
const execSync = require('child_process').execSync;
const queries = require('./queries');

context('/database/queries.js', function() {

  before('create tables in testing database', function() {
    execSync(
      `psql -d lg-curriculum-test -c 'DROP TABLE IF EXISTS skill_checks;'`
    );
    const skill_checksCols = [
      'user_id varchar(255) not null',
      'label varchar(255) not null',
      'updated_at timestamptz default now()'
    ];
    execSync(
      `psql -d lg-curriculum-test -c 'CREATE TABLE skill_checks(${skill_checksCols.join(', ')});'`
    );
    execSync(
      `psql -d lg-curriculum-test -c 'DROP TABLE IF EXISTS event_logs;'`
    );
    const event_logsCols = [
      'user_id varchar(255) not null',
      'type varchar(255) not null',
      'occurred_at timestamptz default now()',
      'metadata jsonb not null'
    ];
    execSync(
      `psql -d lg-curriculum-test -c 'CREATE TABLE event_logs(${event_logsCols.join(', ')});'`
    );
  });

  beforeEach('truncate tables', function() {
    execSync(
      `psql -d lg-curriculum-test -c 'TRUNCATE skill_checks, event_logs;'`
    );
  });

  describe('/database/queries.js/getChecksForUserAndLabels', function() {
    it('should return an object with 2 entries for y and z', function() {
      const entries = [
        `('usera', 'can do x', '2016-04-04')`,
        `('usera', 'can do y', '2016-08-22')`,
        `('usera', 'can do z', '2016-10-02')`,
        `('userb', 'can do y', '2017-11-20')`
      ];
      const valueList = entries.join(', ');
      execSync(
        `psql -d lg-curriculum-test -c "INSERT INTO skill_checks VALUES ${valueList};"`
      );
      return queries
        .getChecksForUserAndLabels(
          {userId: 'usera', labels: ['can do k', 'can do x', 'can do y']}
        )
        .then(function(result) {
          expect(Object.keys(result).length, 'length not 2').to.equal(2);
          expect(result['can do k'], 'k not undefined').to.be.undefined;
          expect(result['can do x'], 'x not true').to.be.true;
          expect(result['can do y'], 'y not true').to.be.true;
          expect(result['can do z'], 'z not undefined').to.be.undefined;
        })
        .catch(function(error) {
          console.log('getChecksForUserAndLabels error:\n' + error);
          throw error;
        });
    });
  });

  describe('/database/queries.js/getCheckLogsForUsers', function() {
    it('should return an object with entries for usera and userc', function() {
      const entries = [
        `('usera', 'skill_check', '2016-04-04', '{\\"label\\": \\"can do x\\", \\"checked\\": true, \\"referrer\\": \\"none\\"}'::jsonb)`,
        `('usera', 'skill_check', '2016-03-11', '{\\"label\\": \\"can do y\\", \\"checked\\": false, \\"referrer\\": \\"same\\"}'::jsonb)`,
        `('userb', 'skill_check', '2016-01-01', '{\\"label\\": \\"can do x\\", \\"checked\\": false, \\"referrer\\": \\"any\\"}'::jsonb)`,
        `('userc', 'skill_check', '2016-01-04', '{\\"label\\": \\"can do z\\", \\"checked\\": true, \\"referrer\\": \\"all\\"}'::jsonb)`,
        `('usera', 'skill_check', '2017-07-14', '{\\"label\\": \\"can do y\\", \\"checked\\": true, \\"referrer\\": \\"every\\"}'::jsonb)`
      ];
      const valueList = entries.join(', ');
      execSync(
        `psql -d lg-curriculum-test -c "INSERT INTO event_logs VALUES ${valueList};"`
      );
      return queries
        .getCheckLogsForUsers(['userc', 'usera'])
        .then(function(result) {
          expect(Object.keys(result).length, 'length not 2').to.equal(2);
          expect(
            result['usera'].length, 'usera array length not 3'
          ).to.equal(3);
          expect(
            result['userc'].length, 'userc array length not 1'
          ).to.equal(1);
          expect(result['userb'], 'userb property defined').to.be.undefined;
          expect(
            result['usera'][0].metadata.label,
            'first usera label not “can do y”'
          ).to.equal('can do y');
        })
        .catch(function(error) {
          console.log('getChecksForUserAndLabels error:\n' + error);
          throw error;
        });
    });
  });

});
