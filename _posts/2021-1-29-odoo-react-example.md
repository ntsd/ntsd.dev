---
layout: post
title:  "Using React app inside Odoo module"
date:   2021-1-29
subtitle: "Add react app to Odoo module and using Odoo Javascript modules"
author: "ntsd"
catalog: true
categories:
    - Programming
tags:
    - Programming
    - Odoo
    - React
    - Frontend
published: false
---

## Initialize Odoo module

First creating `__manifest__.py` and empty `__init__.py`

### __manifest__.py

``` Python
{
    'name': 'Odoo React Example',
    'description': """
        An example odoo module using react app as javascript template
    """,
    'version': '0.1',
    'depends': ['base'],
    'data': [],
    'application': True,
}
```

Create a `model.py` and `__init__.py`  inside `/models`

### /models/model.py

``` python
from odoo import models


class OdooReactExample(models.TransientModel):
    _name = 'odoo_react_example'
```

### /models/__init__.py

``` python
from odoo import models


class OdooReactExample(models.TransientModel):
    _name = 'odoo_react_example'
```
