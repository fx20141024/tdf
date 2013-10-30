angular.module('tdf.agents').controller('AgentsController',
    ['$scope', '$routeParams', '$location', 'Global', 'Utilities', 'Agents',
     'Leagues', 'Trades', '_',
    function ($scope, $routeParams, $location, Global, Utilities, Agents,
              Leagues, Trades, _) {
        $scope.global = Global;

        $scope.getDefault = function() {
            $scope.agent = {
                name: ''
            };

            Leagues.query(function(leagues) {
                $scope.leagues = leagues;
            });
        };

        $scope.create = function() {
            var agent = new Agents($scope.agent);
            agent.$save(function(/*response*/) {
                //$location.path('agents/' + agent._id);
                $location.path('users/profile');
            });
        };

        $scope.remove = function(agent) {
            agent.$remove();
            Utilities.spliceByObject($scope.agents, agent);
            $location.path('agents/');
        };

        $scope.update = function() {
            var agent = $scope.agent;

            agent.$update(function() {
                $location.path('agents/' + agent._id);
            });
        };

        $scope.find = function(query) {
            Agents.query(query, function(agents) {
                $scope.agents = agents;
            });
        };

        $scope.findOne = function() {
            Agents.get({
                agentId: $routeParams.agentId
            }, function(agent) {
                $scope.agent = agent;
            });
        };

        $scope.getDefaultTrade = function() {
            $scope.trade = {
                buy: [],
                sell: []
            };
        };

        $scope.addTrade = function(action) {
            newTrade = {
                s: '',
                q: 0
            };
            if (action == 'buy') {
                $scope.trade.buy.push(newTrade);
            }
            if (action == 'sell') {
                $scope.trade.sell.push(newTrade);
            }
        };

        $scope.executeTrade = function() {
            Trades.update({
                agentId: $routeParams.agentId,
                trade: $scope.trade
            }, function(res) {
                if (_.contains(_.keys(res), 'error')) {
                    $scope.message = {
                        type: 'danger',
                        heading: 'Trade Failed',
                        body: res.error
                    };
                }
                else {
                    $scope.agent = res;
                    $scope.getDefaultTrade();
                    $scope.message = {
                        type: 'success',
                        heading: 'Trade Succeeded',
                        body: 'All trades were successfully executed.'
                    };
                }
            });
        };

        $scope.resetTrades = function() {
            reset = confirm('Are you sure that you want to reset the trades' +
                            ' on this agent?');
            if (reset) {
                Trades.remove({
                    agentId: $routeParams.agentId
                }, function(agent) {
                    $scope.agent = agent;
                    $scope.message = false;
                });
            }
        };
    }]);
