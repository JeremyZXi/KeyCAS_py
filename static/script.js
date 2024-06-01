const editor = grapesjs.init({
    container: '#gjs',
    height: '100vh',
    width: 'auto',
    storageManager: { type: 'indexeddb' },
    pageManager: true,
    assetManager: {
        embedAsBase64: true,
        assets: []
    },
    plugins: [
        'gjs-blocks-basic',
        'grapesjs-plugin-forms',
        'grapesjs-component-countdown',
        'grapesjs-plugin-export',
        'grapesjs-tabs',
        'grapesjs-custom-code',
        'grapesjs-touch',
        'grapesjs-parser-postcss',
        'grapesjs-tooltip',
        'grapesjs-tui-image-editor',
        'grapesjs-typed',
        'grapesjs-style-bg',
        'grapesjs-preset-webpage',
        'grapesjs-project-manager',
        'grapesjs-template-manager' // 添加模板管理器插件
    ],
    pluginsOpts: {
        'grapesjs-template-manager': {
            // 配置模板管理器插件选项
            dbName: 'gjs',
            objectStoreName: 'templates',
            loadFirst: true,
            indexeddbVersion: 4,
            quality: 0.01,
            mdlTitle: 'Template Manager',
            // 可以添加其他选项
        },
        'gjs-preset-webpage': {
            blocksBasicOpts: { flexGrid: 1 },
            navbarOpts: true,
            countdownOpts: true,
            formsOpts: true,
            blocks: ['link-block', 'quote', 'text-basic']
        },
        'grapesjs-plugin-forms': {
            blocks: ['form', 'input', 'textarea', 'select', 'button', 'label', 'checkbox', 'radio']
        },
        'grapesjs-component-countdown': { /* options */ },
        'grapesjs-plugin-export': { /* options */ },
        'grapesjs-tabs': { /* options */ },
        'grapesjs-custom-code': { /* options */ },
    }
});

// 添加页面加载完成后的事件监听器
window.addEventListener('load', () => {
    document.getElementById('loading-page').style.display = 'none';
});

// 添加下载按钮到顶栏
editor.Panels.addButton('options', {
    id: 'download',
    className: 'gjs-btn',
    label: 'Download',
    command: 'download-button'
});

// 添加保存按钮到顶栏
editor.Panels.addButton('options', {
    id: 'save',
    className: 'gjs-btn',
    label: 'Save',
    command: 'save-button'
});

// 添加打开模板按钮到顶栏
editor.Panels.addButton('options', {
    id: 'open-templates',
    className: 'fa fa-folder-o',
    attributes: {
        title: 'Open projects and templates'
    },
    command: 'open-templates', // 打开模态框
});

// 添加打开页面按钮到视图栏
editor.Panels.addButton('views', {
    id: 'open-pages',
    className: 'fa fa-file-o',
    attributes: {
        title: 'Take Screenshot'
    },
    command: 'open-pages',
    togglable: false
});

// 定义下载按钮的命令
editor.Commands.add('download-button', {
    run: function(editor) {
        const htmlContent = editor.getHtml();
        const cssContent = editor.getCss();
        const link = document.createElement('a');
        const blob = new Blob([htmlContent, '\n<style>', cssContent, '</style>'], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = 'content.html';
        link.click();
        URL.revokeObjectURL(url);
    }
});

// 定义保存按钮的命令
editor.Commands.add('save-button', {
    run: function(editor) {
        const content = editor.getHtml() + '<style>' + editor.getCss() + '</style>';
        fetch('/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content: content })
        }).then(response => response.json())
            .then(data => alert(data.message));
    }
});

// 加载服务器上的内容
