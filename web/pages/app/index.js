import homeApp from './home/index.vue';
import '../../styles/index.scss';
if(document.getElementById('home-app')) {
    new Vue({
        render: h => h(homeApp)
    }).$mount('#home-app');
}
import notFound from './error/404';
if(document.getElementById('not-found-app')) {
    new Vue({
        render: h => h(notFound)
    }).$mount('#not-found-app');
}
