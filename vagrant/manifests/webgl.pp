include apache
include mysql
#setup ntpd
include ntp
include php
include timezone
# php modules
include php::dev
include php::pear
include php::pecl
php::module { mysql: }

apache::virtualhost    { "webgl.dev":
                         documentroot => '/var/www/webgl.dev' 
                       }
