function q(f) {
    function h() {
      var h = window.scrollY || window.pageYOffset || document.body.scrollTop,
        y = h + 0.4 * window.innerHeight,
        E = (function f(h, y, E) {
          var w, L;
          h.forEach(function (f) {
            f.offsetTop > E ? !w && f.offsetTop < y && (w = f) : (w = f);
          }),
            w &&
              w.subSections.length &&
              (L = f(w.subSections, y, E)) &&
              (w = L);
          return w;
        })(f.data, h, y);
      return (
        (function (f, h) {
          var y = h.querySelector("[data-sn-active]");
          if (f) {
            var E = h.querySelector("[data-sn-section=" + f.id + "]");
            E &&
              E !== y &&
              (y &&
                (y.classList.remove("scroll-nav__item--active"),
                y.removeAttribute("data-sn-active")),
              E.classList.add("scroll-nav__item--active"),
              E.setAttribute("data-sn-active", !0));
          } else
            y &&
              (y.classList.remove("scroll-nav__item--active"),
              y.removeAttribute("data-sn-active"));
        })(E, f.nav),
        E
      );
    }
    return window.addEventListener("scroll", h), h;
  }