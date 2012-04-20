
testServers();

function testServers() {
  // Some sanity checks for SERVERS:
  ok('_primary' in SERVERS);
  ok('bad_content_type' in SERVERS);
  ok('missing_required_field' in SERVERS);

  // Check the APIs are all available:
  ok(navigator.mozApps.getInstalled);
  ok(navigator.mozApps.getSelf);
  ok(navigator.mozApps.install);

  // Also make sure we have mgmt routines:
  ok(navigator.mozApps.mgmt);
  ok(navigator.mozApps.mgmt.addEventListener);
  ok(navigator.mozApps.mgmt.removeEventListener);

  testRemoveAll(testMissingRequiredInstallArgument);
}

function testRemoveAll(next) {
  // Delete all applications (that might be left over from other activity)
  // and verify that getAll() yields no apps

  var pending = navigator.mozApps.mgmt.getAll();
  SimpleTest.waitForExplicitFinish();
  pending.onsuccess = function () {
    var m = this.result;
    var total = m.length;
    for (var i=0; i < m.length; i++) {
      var app = m[i];
      var uninstall = app.uninstall();
      uninstall.onsuccess = function () {
        total--;
        if (total === 0) {
          ok(true, 'All uninstalled');
          SimpleTest.finish();
          SimpleTest.waitForExplicitFinish();
          var newPending = navigator.mozApps.mgmt.getAll();
          newPending.onsuccess = function () {
            is(this.result.length, 0, "Nothing left after uninstalling everything");
            SimpleTest.finish();
            if (next) {
              next();
            }
          };
          newPending.onerror = function () {
            ok(false, "Error: " + this.error);
            SimpleTest.finish();
          };
        }
      };
      uninstall.onerror = function () {
        ok(false, "Uninstall got error: " + this.error);
        SimpleTest.finish();
      };
    }
  };

  pending.onerror = function () {
    ok(false, "Error in getAll: " + this.error);
    SimpleTest.finish();
  };
}

function testMissingRequiredInstallArgument() {
  try {
    navigator.mozApps.install();
  } catch (e) {
    is(e + '', 'install missing required url argument');
    return;
  }
  ok(false, 'navigator.mozApps.install() should fail');
}

function testInstallBasicApp() {
  handlePending(
    navigator.mozApps.install(SERVERS['basic_app'] + "/manifest.webapp", null),
    function () {
      var app = this.result;
      ok(app.installOrigin);
      is(typeof app.installTime, 'number');
      is(app.manifest.installs_allowed_from[0], '*');
      is(app.manifest.name, "Super Crazy Basic App");
      ok(app.manifestURL);
      is(app.origin, SERVERS['basic_app']);
      ok(app.receipts === null);
      handlePending(
        navigator.mozApps.mgmt.getAll(),
        function () {
          is(this.result.length, 1);
          is(this.result[0].origin, SERVERS['basic_app']);
        });
    });
}

function testReinstallBasicApp() {
  // We'll reinstall the *same* app, but with a different manifest
  // this should replace the old app
  handlePending(
    navigator.mozApps.install(SERVERS['basic_app'] + "/manifest2.webapp", null),
    function () {
      handlePending(
        navigator.mozApps.getAll(),
        function () {
          is(this.result.length, 1);
          var app = this.result[0];
          is(app.origin, SERVERS['basic_app']);
          is(app.manifest.name, "Wild and Crazy Basic App");
        });
    });
}

function handlePending(pending, after) {
  SimpleTest.waitForExplicitFinish();  
  pending.onerror = function () {
    ok(false, "Error in pending operation: " + this.error);
    SimpleTest.finish();
  };
  after.onsuccess = function () {
    after.apply(this);
    SimpleTest.finish();
  };
}
