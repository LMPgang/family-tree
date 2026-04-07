// 家族族谱网站 - 主要JavaScript文件

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 添加平滑滚动效果
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 添加导航栏滚动效果
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        if (currentScroll <= 0) {
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
        }

        lastScroll = currentScroll;
    });

    // 添加卡片悬停效果增强
    const cards = document.querySelectorAll('.feature-card, .member-card, .value-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // 添加按钮点击波纹效果
    const buttons = document.querySelectorAll('.btn, button');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;

            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });

    // 添加页面加载动画
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(30px)';
        heroContent.style.transition = 'opacity 0.8s ease, transform 0.8s ease';

        setTimeout(() => {
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 200);
    }

    // 添加滚动显示动画
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // 观察所有需要动画的元素
    const animatedElements = document.querySelectorAll('.feature-card, .member-card, .value-card, .timeline-item');
    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
    });

    // 添加搜索功能（如果有搜索框）
    const searchInputs = document.querySelectorAll('input[type="text"]');
    searchInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
            this.parentElement.style.transition = 'transform 0.3s ease';
        });

        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });

    // 添加移动端菜单切换（如果需要）
    const createMobileMenu = function() {
        if (window.innerWidth <= 768) {
            const nav = document.querySelector('.navbar');
            const navMenu = document.querySelector('.nav-menu');

            if (!document.querySelector('.mobile-menu-toggle')) {
                const menuToggle = document.createElement('button');
                menuToggle.className = 'mobile-menu-toggle';
                menuToggle.innerHTML = '☰';
                menuToggle.style.cssText = `
                    display: block;
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.5rem;
                    cursor: pointer;
                `;

                menuToggle.addEventListener('click', function() {
                    navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
                    navMenu.style.flexDirection = 'column';
                    navMenu.style.position = 'absolute';
                    navMenu.style.top = '100%';
                    navMenu.style.left = '0';
                    navMenu.style.right = '0';
                    navMenu.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                    navMenu.style.padding = '1rem';
                    navMenu.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
                });

                nav.querySelector('.container').appendChild(menuToggle);
            }
        }
    };

    createMobileMenu();
    window.addEventListener('resize', createMobileMenu);

    // 添加表单验证（如果有表单）
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
            let isValid = true;

            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = 'red';
                } else {
                    input.style.borderColor = '#ddd';
                }
            });

            if (isValid) {
                // 表单验证通过，可以提交
                alert('表单提交成功！');
                form.reset();
            } else {
                alert('请填写所有必填字段');
            }
        });
    });

    // 添加图片懒加载
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));

    // 添加返回顶部按钮
    const createBackToTop = function() {
        if (!document.querySelector('.back-to-top')) {
            const backToTop = document.createElement('button');
            backToTop.className = 'back-to-top';
            backToTop.innerHTML = '↑';
            backToTop.style.cssText = `
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 50px;
                height: 50px;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 50%;
                font-size: 1.5rem;
                cursor: pointer;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                z-index: 1000;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            `;

            backToTop.addEventListener('click', function() {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });

            document.body.appendChild(backToTop);

            window.addEventListener('scroll', function() {
                if (window.pageYOffset > 300) {
                    backToTop.style.opacity = '1';
                    backToTop.style.visibility = 'visible';
                } else {
                    backToTop.style.opacity = '0';
                    backToTop.style.visibility = 'hidden';
                }
            });
        }
    };

    createBackToTop();

    // 添加键盘快捷键
    document.addEventListener('keydown', function(e) {
        // ESC键关闭弹窗
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                modal.style.display = 'none';
            });
        }

        // Ctrl/Cmd + K 聚焦搜索框
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('input[type="text"]');
            if (searchInput) {
                searchInput.focus();
            }
        }
    });

    // 添加控制台欢迎信息
    console.log('%c欢迎访问家族族谱网站！', 'color: #667eea; font-size: 20px; font-weight: bold;');
    console.log('%c传承家族历史，记录家族荣耀', 'color: #764ba2; font-size: 14px;');
});

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }

    .back-to-top:hover {
        background: #764ba2;
        transform: translateY(-3px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    }

    @media (max-width: 768px) {
        .back-to-top {
            bottom: 20px;
            right: 20px;
            width: 40px;
            height: 40px;
            font-size: 1.2rem;
        }
    }
`;
document.head.appendChild(style);