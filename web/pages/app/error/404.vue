<template>
    <div class="container" id="not-found">
        <div class="text-center page-header">
            <h1>找不到页面</h1>
        </div>
    </div>
</template>
<script>
    export default {
        appId: 'not-found',
        data() {
            return {}
        },
        methods: {}
    }
</script>
<style lang="scss" scoped>
    .page-header {
        margin: 80px 0 20px;
        h1 {
            font-size: 50px;
            height: 76px;
            line-height: 76px;
            color: blue;
        }
    }
</style>
