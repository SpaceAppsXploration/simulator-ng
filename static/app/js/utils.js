var safeApply = function(fn) { // utility to safe apply for avoiding $digest errors
                var phase = this.$root.$$phase;
                if(phase == '$apply' || phase == '$digest') {
                    if(fn && (typeof(fn) === 'function')) {
                      fn();
                    }
                } else {
                this.$apply(fn);
                }
            };