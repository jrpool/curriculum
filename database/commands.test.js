'use strict';
const execSync = require('child_process').execSync;
const commands = require('./commands');

context('/database/commands.js', function() {

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
      'psql -d lg-curriculum-test -c \'TRUNCATE skill_checks, event_logs;\''
    );
  });

  describe('/database/commands.js/setSkillCheck', function() {
    it(
      'adding a skill should add it to skill_checks and event_logs',
      function() {
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
        return commands
          .setSkillCheck(
            {user_id: 'userb', label: 'can do x', checked: true, referrer: 'none'}
          )
          .then(function() {
            expect(execSync(
              `psql -d lg-curriculum-test -tc "SELECT COUNT(*) = 2 FROM skill_checks WHERE user_id = 'userb';"`, {encoding: 'utf8'}
            ), 'userb skill count not 2').to.include('t');
            expect(execSync(
              `psql -d lg-curriculum-test -tc "SELECT COUNT(*) = 1 FROM skill_checks WHERE user_id = 'userb' AND label = 'can do y';"`, {encoding: 'utf8'}
            ), 'userb cannot do y').to.include('t');
            expect(execSync(
              `psql -d lg-curriculum-test -tc "SELECT COUNT(*) = 1 FROM skill_checks WHERE user_id = 'userb' AND label = 'can do x';"`, {encoding: 'utf8'}
            ), 'userb cannot do x').to.include('t');
            expect(execSync(
              `psql -d lg-curriculum-test -tc "SELECT COUNT(*) = 0 FROM skill_checks WHERE user_id = 'userb' AND label = 'can do z';"`, {encoding: 'utf8'}
            ), 'userb can do z').to.include('t');
            expect(execSync(
              `psql -d lg-curriculum-test -tc "SELECT COUNT(*) = 1 FROM event_logs;"`, {encoding: 'utf8'}
            ), 'event-log count not 1').to.include('t');
            expect(execSync(
              `psql -d lg-curriculum-test -tc "SELECT COUNT(*) = 1 FROM event_logs WHERE user_id = 'userb';"`, {encoding: 'utf8'}
            ), 'userb event-log count not 1').to.include('t');
            expect(execSync(
              `psql -d lg-curriculum-test -tc "SELECT COUNT(*) = 0 FROM event_logs WHERE user_id = 'usera';"`, {encoding: 'utf8'}
            ), 'usera event-log count not 0').to.include('t');
            expect(execSync(
              `psql -d lg-curriculum-test -tc "SELECT COUNT(*) = 1 FROM event_logs WHERE user_id = 'userb' AND metadata->>'label' = 'can do x';"`, {encoding: 'utf8'}
            ), 'userb “can do x” event-log count not 1').to.include('t');
            expect(execSync(
              `psql -d lg-curriculum-test -tc "SELECT COUNT(*) = 0 FROM event_logs WHERE user_id = 'userb' AND metadata->>'label' = 'can do y';"`, {encoding: 'utf8'}
            ), 'userb “can do y” event-log count not 0').to.include('t');
          })
          .catch(function(error) {
            console.log('setSkillCheck error:\n' + error);
            throw error;
          });
      }
    );
  });

  describe('/database/commands.js/setSkillCheck', function() {
    it(
      'deleting a skill should delete it from skill_checks but add the deletion to event_logs',
      function() {
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
        return commands
          .setSkillCheck(
            {user_id: 'usera', label: 'can do y', checked: false, referrer: 'none'}
          )
          .then(function() {
            expect(execSync(
              `psql -d lg-curriculum-test -tc "SELECT COUNT(*) = 2 FROM skill_checks WHERE user_id = 'usera';"`, {encoding: 'utf8'}
            ), 'usera skill count not 2').to.include('t');
            expect(execSync(
              `psql -d lg-curriculum-test -tc "SELECT COUNT(*) = 0 FROM skill_checks WHERE user_id = 'usera' AND label = 'can do y';"`, {encoding: 'utf8'}
            ), 'usera can still do y').to.include('t');
            expect(execSync(
              `psql -d lg-curriculum-test -tc "SELECT COUNT(*) = 1 FROM skill_checks WHERE user_id = 'usera' AND label = 'can do x';"`, {encoding: 'utf8'}
            ), 'usera cannot do x').to.include('t');
            expect(execSync(
              `psql -d lg-curriculum-test -tc "SELECT COUNT(*) = 1 FROM skill_checks WHERE user_id = 'userb' AND label = 'can do y';"`, {encoding: 'utf8'}
            ), 'userb cannot do y').to.include('t');
            expect(execSync(
              `psql -d lg-curriculum-test -tc "SELECT COUNT(*) = 0 FROM skill_checks WHERE user_id = 'userb' AND label = 'can do z';"`, {encoding: 'utf8'}
            ), 'userb can do z').to.include('t');
            expect(execSync(
              `psql -d lg-curriculum-test -tc "SELECT COUNT(*) = 1 FROM event_logs;"`, {encoding: 'utf8'}
            ), 'event-log count not 1').to.include('t');
            expect(execSync(
              `psql -d lg-curriculum-test -tc "SELECT COUNT(*) = 1 FROM event_logs WHERE user_id = 'usera';"`, {encoding: 'utf8'}
            ), 'usera event-log count not 1').to.include('t');
            expect(execSync(
              `psql -d lg-curriculum-test -tc "SELECT COUNT(*) = 0 FROM event_logs WHERE user_id = 'userb';"`, {encoding: 'utf8'}
            ), 'userb event-log count not 0').to.include('t');
            expect(execSync(
              `psql -d lg-curriculum-test -tc "SELECT COUNT(*) = 1 FROM event_logs WHERE user_id = 'usera' AND metadata->>'label' = 'can do y';"`, {encoding: 'utf8'}
            ), 'usera “can do y” event-log count not 1').to.include('t');
            expect(execSync(
              `psql -d lg-curriculum-test -tc "SELECT COUNT(*) = 1 FROM event_logs WHERE user_id = 'usera' AND metadata->>'label' = 'can do y' AND metadata->>'checked' = 'false';"`, {encoding: 'utf8'}
            ), 'usera “can do y” unchecking event-log count not 1')
            .to.include('t');
            expect(execSync(
              `psql -d lg-curriculum-test -tc "SELECT COUNT(*) = 0 FROM event_logs WHERE user_id = 'usera' AND metadata->>'label' = 'can do y' AND metadata->>'checked' = 'true';"`, {encoding: 'utf8'}
            ), 'usera “can do y” checking event-log count not 0')
            .to.include('t');
          })
          .catch(function(error) {
            console.log('setSkillCheck error:\n' + error);
            throw error;
          });
      }
    );
  });

});
