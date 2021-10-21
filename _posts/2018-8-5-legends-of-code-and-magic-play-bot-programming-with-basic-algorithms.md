---
layout: post
title:  "Legends of Code and Magic เล่น Bot Programming ด้วย Basic Algorithms"
date:   2018-08-5 12:30:54
subtitle: "สร้างบอทเกมเพื่อเล่นเกมไพ่แข่งกับคนอื่น"
author: "ntsd"
catalog: true
categories: Programming
header-img: "../img/in-post/2018-8-5-legends-of-code-and-magic-play-bot-programming-with-basic-algorithms/post-legends-of-code-and-magic.png"
tags:
    - Artificial Intelligence
    - Programming
    - Python
---

Codingame เป็นเว็บที่มีเว็บโปรแกรมมิ่งแนว Bot Programming ที่ให้ผู้เล่นเขียนโค๊ดเพื่อให้บอทไปสู้กับบอทคนอื่น

สามารถเล่นได้ที่นี่ [Link](https://www.codingame.com/contests/legends-of-code-and-magic-marathon)

สำหรับคนที่ยังไม่ค่อยเข้าใจระบบเกม ให้ลองเลื่อนลงไปดู Game loops and Input ก่อน

## Requirement skills

- Programming (Python Syntax)
- Basic Algorithms
- OOP นิดหน่อย

LEGENDS OF CODE AND MAGIC เป็นเกมนี้จะเป็นบอร์ดเกมคล้าย Hearthstone

ตัวอย่างเกม <https://www.codingame.com/replay/328489470>

มีผู้เล่นสองคนใช้ไพ่ต่อสู้กันใครเลือดหมดก่อนแพ้

โดยจะแบ่งเป็น 2 phases

phase แรกจะเป็นการเลือกไพ่ 1 ใน 3 จากไพ่ที่สุ่มมา จนครบ 30 ใบ

phase ที่สองจะเป็นการ Battle

โดยใน battle phase จะมีมานาเริ่มต้น 1 และเพิ่ม 1 ทุกๆเทริน

โดยมานาสามารถนำไปจ่ายเพื่อใช้ไพ่

ในเกมจะมีไพ่ 2 ชนิด คือไพ่ creatures กับ items
แต่ผมจะอธิบายแค่ creature

เมื่อใช้ไพ่ creature จากบนมือจะลงไปบนบอร์ด โดย creature สามารถโจมตีได้เมื่ออยู่บนบอร์ด

เลือดจะลดหากโจมตี creature ด้วยกันเอง

## creature abilities

creature จะมีความสามามารถพิเศษแตกต่างกันดังนี้

``` Text
Breakthrough: Creatures with Breakthrough can deal extra damage to the opponent when they attack enemy creatures. If their attack damage is greater than the defending creature's defense, the excess damage is dealt to the opponent.
Charge: Creatures with Charge can attack the turn they are summoned.
Drain: Creatures with Drain heal the player of the amount of the damage they deal (when attacking only).
Guard: Enemy creatures must attack creatures with Guard first.
Lethal: Creatures with Lethal kill the creatures they deal damage to.
Ward: Creatures with Ward ignore once the next damage they would receive from any source. The "shield" given by the Ward ability is then lost.
```

## Class

### import อะไรให้พร้อม

``` Python
import sys # ใช้เพื่อ print log
from copy import deepcopy  # deepcopy เพื่อให้ object ต่างๆ ไม่ reference เวลา simulate
```

### class Player

``` Python
class Player:
    def __init__(self):
        self.mana_curve = [0, 7, 6, 5, 4, 3, 0, 0, 0, 0, 0, 0, 0] # mana curve ใช่เพื่อเลือไพ่ให้ได้ curve ตามต้องการ
    def setEnemy(self, player):
        self.op = player
    def update(self, player_health, player_mana, player_deck, player_rune): # ใช้เพื่ออัพเดตค่าทุกๆเทริน
        self.__dict__.update(l for l in locals().items() if l[0] != 'self') # map local vars ใส่ self vars
        self.hands = []
        self.boards = []
    def addHand(self, card): # ใช้เพื่อเพิ่มไพ่ในมือ
        self.hands.append(card)
    def addBoard(self, card):  # ใช้เพื่อเพิ่มไพ่บอร์ด
        self.boards.append(card)
```

### class Card

``` Python
class Card:
    def __init__(self, card_number, instance_id, location, card_type, cost, attack, defense, abilities, my_health_change, opponent_health_change, card_draw):
        self.__dict__.update(l for l in locals().items() if l[0] != 'self')
        self.action = 1
        self.shield = 1 if 'W' in abilities else 0
        self.lethal = 1 if 'L' in abilities else 0
        self.guard = 1 if 'G' in abilities else 0
        self.charge = 1 if 'C' in abilities else 0
        self.drain = 1 if 'D' in abilities else 0
        self.breakthrough = 1 if 'B'in abilities else 0
        self.live = 1
    def __hash__(self): # ใช้เพื่อ hash เปรียบเทียบ object ด้วย id
         return hash(self.instance_id)
    def __eq__(self, other): # ใช้เพื่อเปรียบเทียบ Equal ของ Object
        return (
            self.__class__ == other.__class__ and
            self.instance_id == other.instance_id
        )
```

### class Creature

``` Python
class Creature(Card): # inheritance Card เพื่อบอกว่าเป็น Subclass ของ Card
    def attackTarget(self, target): # ใช้เมื่อโจมตี Creature ตัวอื่น
        self.action = 0
        if self.shield: # เมื่อดาเมจโดน shield จะหาย
            self.shield = 0
        else:
            self.defense -= target.attack # เลือดลดด้วยพลังโจมตีของเป้าหมาย
            if self.defense <=0 or (target.lethal and type(target) is Creature):
                self.live = 0 # เมื่อเลือดหมด
        if target.shield: # damage to target
            target.shield = 0
        else:
            target.defense -= self.attack # เลือดเป้าหมายลดด้วยพลังโจมตีของผู้ตี
            if target.defense <=0 or (self.lethal and type(target) is Creature):
                target.live = 0
```

### class Item

``` Python
class Item(Card):
    def use(self, target):
        pass
```

## Algorithms

โดยวิธีที่ผมใช้เป็น Basic Algorithms ในการสร้าง Rules ต่างๆ ในการเล่นเกม เพื่อทำให้ชนะการเล่น โดยผมจะใส่เป็น Method ของ Player ดังนี้

### Draft Card

โดยผมจะเลือกตาม mana curve เป็นหลักและ value ของไพ่ โดยผมใช้ attack * defence เป็น vaule ของไพ่

``` Python
def draft(self, draft_list): # เลือกไพ่ 1 ใน 3
        max_value = 0
        card_no=0
        for i, card in enumerate(draft_list):
            if type(card) is Creature: # ดูว่าไพ่เป็นชนิด Creature
                value = card.attack * card.defense
                if self.mana_curve[card.cost] > 0:
                    value += 100 # ถ้า curve ยังไม่เต็มให้เลือกตาม curve ก่อน โดยเพิ่ม value
                if value > max_value: # เลือกไพ่ที่มี value มากสุด
                    max_value = value
                    card_no = i
        self.mana_curve[draft_list[card_no].cost]-=1
        print('PICK {}'.format(card_no))
```

### Battle Parse

โดยผมจะ summon creatures ก่อน แล้วจึงโจมตีฝั่งตรงข้าม

โดยจะทำเป็น action list ดังนี้

``` Python
    def useItem(self): # ผมยังไม่ได้ทำให้ใช้ item ได้เลยว่างไว้ก่อน
        return []

    def play(self):
        action_list = []
        action_list += self.summon()
        action_list += self.useItem()
        action_list += self.creatureAttack()
        print(';'.join(action_list)) #  actions จะแบ่งด้วย ;
```

### Summon

ต่อมาเป็นการเรียก Creature จากบนมือ โดยผมจะเลือกตัวที่มานามากที่สุดก่อน

``` Python
def summon(self):
        mana=self.player_mana
        action_list = []
        boards_count = len(self.boards)
        creature_on_hand = filter(lambda x: type(x) is Creature ,self.hands) # filter เฉพาะ Creature ที่อยู่บนมือ
        for c in sorted(creature_on_hand, key=lambda x: x.cost, reverse=True): # เรียงตาม มานา
            if boards_count < 6: # เช็คถ้าบอร์ดยังไม่เต็ม
                if c.cost<=mana: # เช็คว่ายังเหลือมานายังพอเรียก
                    mana-=c.cost
                    action_list.append("SUMMON {}".format(c.instance_id))
                    if c.charge: # ถ้ามี charge ability จะสามารถตีได้เลย ผมเลยใส่ในบอร์ด
                        self.boards.append(c)
                    boards_count += 1
        return action_list # return action list
```

### Attack

ในการโจมตีของ creature ผมจะสร้าง rules ลำดับความสำคัญให้มันว่าจะต้องทำอะไรก่อน โดยผมจะสร้าง Rule Class โดยจะใส่ lambda functions ให้กับมันดังนี้

- mySort  - เรียง creatures ของเรา
- myFilter - filter creatures ของเรา
- opSort - เรียง creatures ของคู่ต่อสู้
- opFilter - filter creatures ของคู่ต่อสู้
- rule - กฏเพื่อให้เข้าเงื่อนไข

### Rule Class

``` Python
class AttackRule:
    def __init__(self, mySort, myFilter, opSort, opFilter, rule):
        self.__dict__.update(l for l in locals().items() if l[0] != 'self')
```

### Creature Attack

ผมจะ simulate เพื่อให้ creature โจมตี crature ฝั่งตรงข้ามก่อนตามเงื่อนไขที่กำหนด จากนั้นถ้าเข้าเงื่อนไขจึงเก็บ action และบันทึกค่าว่าโจมตีจริงๆ

``` Python
def creatureAttack(self):
        action_list = []

        attack_rules=[
            # โจมตี taunt creature ให้ได้คุ้มค่า
            AttackRule(lambda my: -my.defense, lambda my: my.action,
            lambda op: -op.attack, lambda op: op.guard==1,
            lambda my, op: my.live and op.live==0),
            # โจมตี taunt creature โดยที่ของเรายังไม่ตาย
            AttackRule(lambda my: -my.attack, lambda my: my.action,
            lambda op: -op.attack, lambda op: op.guard==1,
            lambda my, op:  my.live),
            # โจมตี taunt creature ไม่ว่ายังไงก็ตาม
            AttackRule(lambda my: -my.attack, lambda my: my.action,
            lambda op: -op.attack, lambda op: op.guard==1,
            lambda my, op: True),
            # โจมตีโดยที่ creature ฝั่งตรงข้ามตาย แต่ฝั่งเราไม่ตาย
            AttackRule(lambda my: my.attack, lambda my: my.action,
            lambda op: -op.attack, lambda op: True,
            lambda my, op: my.live and op.live==0),
            # โจมตีโดยที่ creature ฝั่งตรงข้ามตาย
            AttackRule(lambda my: my.attack, lambda my: my.action,
            lambda op: -op.attack, lambda op: True,
            lambda my, op: op.live==0), # and self.player_health < self.op.player_health
        ]

        for attack_rule in attack_rules:# loop ทุกๆ rules
            # sort และ filter creatures ตาม rule ที่กำหนด
            for my_c in sorted(filter(attack_rule.myFilter, self.boards), key=attack_rule.mySort):
                for op_c in sorted(filter(attack_rule.opFilter, self.op.boards), key=attack_rule.opSort):
                    my_c_temp = deepcopy(my_c) # deep copy เพื่อ simulate ว่าถ้าตีผลจะเป็นยังไง
                    op_c_temp = deepcopy(op_c)
                    my_c_temp.attackTarget(op_c_temp)
                    if attack_rule.rule(my_c_temp, op_c_temp): # ถ้าลองโจมตีแล้วเข้าเงื่อนไขให้ทำการบันทึก action
                        my_c = my_c_temp
                        op_c = op_c_temp
                        action_list.append("ATTACK {} {} Pika!".format(my_c.instance_id, op_c.instance_id))
                        my_c.action = 0 # เมื่อโจมตีแล้วจะตีไม่ได้อีก
                        if not my_c.live:
                            self.boards.remove(my_c) # ถ้าตายจำออกจากบอร์ด
                        if not op_c.live:
                            self.op.boards.remove(op_c)
                        break

        # สั่งให้ตีฮีโร่ฝั่งตรงข้ามเมื่อไม่เข้าเงื่อนไขข้างบน
        for my_c in self.boards:
            if my_c.action:
                action_list.append("ATTACK {} {} Pikachu!!".format(my_c.instance_id, -1))
                my_c.action = 0

        return action_list
```

### Game loops and Input

main ของ Bot ใช้เพื่ออัพเดตค่าต่างๆของเกมโดยผู้เล่นจะสลับฝั่งกันเล่นและอัพเดตค่าผ่านทาง input, output

โดย Bot Game ใน Codingame นั้นจะประมวลผลเกมเป็น loop ดังนี้

game ประมวลผล

player 1 รับค่า และ ประมวลผล

player 1 ส่งค่า

game ประมวลผล

player 2 รับค่า และ ประมวลผล

player 2 ส่งค่า

เป็น loop จนกว่าจะจบเกม

### Main

``` Python
my_player = Player()
op_player = Player()
my_player.setEnemy(op_player)
while True:
    player_health, player_mana, player_deck, player_rune = [int(j) for j in input().split()]
    my_player.update(player_health, player_mana, player_deck, player_rune) # อัพเดตค่าของ player ทุกๆเทริน
    player_health, player_mana, player_deck, player_rune = [int(j) for j in input().split()]
    op_player.update(player_health, player_mana, player_deck, player_rune)

    opponent_hand = int(input())
    card_count = int(input())
    draft_list = []
    for i in range(card_count):
        # Input card และ map แปลง input ที่เป็นตัวเลขให้เป็น Int
        card_number, instance_id, location, card_type, cost, attack, defense, abilities, my_health_change, opponent_health_change, card_draw = map(lambda x: int(x) if x[-1].isdigit() else x,input().split())
        if card_type!=0: # เช็คว่าเป็นไพ่ชนิดใด
            card = Item(card_number, instance_id, location, card_type, cost, attack, defense, abilities, my_health_change, opponent_health_change, card_draw)
        else:
            card = Creature(card_number, instance_id, location, card_type, cost, attack, defense, abilities, my_health_change, opponent_health_change, card_draw)
        if my_player.player_mana==0:
            draft_list.append(card)
        elif location==0: # เช็คว่ายู่บนมือของเรา
            my_player.addHand(card)
        elif location==1: # เช็คว่ายู่บนสนามของเรา
            my_player.addBoard(card)
        elif location==-1: # เช็คว่ายู่บนสนามของคู่แข่ง
            op_player.addBoard(card)

    if my_player.player_mana==0: # ถ้ามานาเท่ากับ 0 แสดงว่าเป็น draft parse
        my_player.draft(draft_list)
    else:
        my_player.play()
```

## Full Code

``` Python
import sys
from copy import deepcopy

def log(*args,**kwargs):
    print(*args,**kwargs, file=sys.stderr)

class AttackRule:
    def __init__(self, mySort, myFilter, opSort, opFilter, rule):
        self.__dict__.update(l for l in locals().items() if l[0] != 'self')

class Player:
    def __init__(self):
        self.mana_curve = [0, 7, 6, 5, 4, 3, 0, 0, 0, 0, 0, 0, 0]
    def setEnemy(self, player):
        self.op = player
    def update(self, player_health, player_mana, player_deck, player_rune):
        self.__dict__.update(l for l in locals().items() if l[0] != 'self')
        self.hands = []
        self.boards = []
    def addHand(self, card):
        self.hands.append(card)
    def addBoard(self, card):
        self.boards.append(card)

    def draft(self, draft_list):
        max_value = 0
        card_no=0
        for i, card in enumerate(draft_list):
            if type(card) is Creature: #todo add item pick
                value = card.attack * card.defense
                if self.mana_curve[card.cost] > 0:
                    value += 100
                if value > max_value:
                    max_value = value
                    card_no = i
        self.mana_curve[draft_list[card_no].cost]-=1
        print('PICK {}'.format(card_no))

    def summon(self): # to do make mana zero
        mana=self.player_mana
        action_list = []
        boards_count = len(self.boards)
        creature_on_hand = filter(lambda x: type(x) is Creature ,self.hands)
        for c in sorted(creature_on_hand, key=lambda x: x.cost, reverse=True):
            if boards_count < 6 or 1: # to do need to check summon again after trade
                if c.cost<=mana:
                    mana-=c.cost
                    action_list.append("SUMMON {}".format(c.instance_id))
                    if c.charge:
                        self.boards.append(c)
                    boards_count += 1
        return action_list

    def creatureAttack(self):
        action_list = []

        attack_rules=[
            # trade taunt value
            AttackRule(lambda my: -my.defense, lambda my: my.action,
            lambda op: -op.attack, lambda op: op.guard==1,
            lambda my, op: my.live and op.live==0),
            # attack taunt and survive
            AttackRule(lambda my: -my.attack, lambda my: my.action,
            lambda op: -op.attack, lambda op: op.guard==1,
            lambda my, op:  my.live),
            # attack taunt
            AttackRule(lambda my: -my.attack, lambda my: my.action,
            lambda op: -op.attack, lambda op: op.guard==1,
            lambda my, op: True),
            # trade lethal
            AttackRule(lambda my: my.defense, lambda my: my.action,
            lambda op: -op.attack, lambda op: op.lethal==1,
            lambda my, op: op.live==0),
            # trade value
            AttackRule(lambda my: my.attack, lambda my: my.action,
            lambda op: -op.attack, lambda op: True,
            lambda my, op: my.live and op.live==0),
            # trade equal
            AttackRule(lambda my: my.attack, lambda my: my.action,
            lambda op: -op.attack, lambda op: True,
            lambda my, op: op.live==0), # and self.player_health < self.op.player_health
        ]

        for attack_rule in attack_rules:
            for my_c in sorted(filter(attack_rule.myFilter, self.boards), key=attack_rule.mySort):
                for op_c in sorted(filter(attack_rule.opFilter, self.op.boards), key=attack_rule.opSort):
                    my_c_temp = deepcopy(my_c)
                    op_c_temp = deepcopy(op_c)
                    my_c_temp.attackTarget(op_c_temp)
                    if attack_rule.rule(my_c_temp, op_c_temp):
                        my_c = my_c_temp
                        op_c = op_c_temp
                        action_list.append("ATTACK {} {} Pika!".format(my_c.instance_id, op_c.instance_id))
                        my_c.action = 0
                        if not my_c.live:
                            self.boards.remove(my_c)
                        if not op_c.live:
                            self.op.boards.remove(op_c)
                        break
        # go face
        for my_c in self.boards:
            if my_c.action:
                action_list.append("ATTACK {} {} Pikachu!!".format(my_c.instance_id, -1))
                my_c.action = 0

        return action_list

    def useItem(self):# item red target op minion
        return []

    def play(self):
        action_list = []
        action_list += self.summon()
        action_list += self.useItem()
        action_list += self.creatureAttack()
        print(';'.join(action_list))

class Card:
    def __init__(self, card_number, instance_id, location, card_type, cost, attack, defense, abilities, my_health_change, opponent_health_change, card_draw):
        self.__dict__.update(l for l in locals().items() if l[0] != 'self')
        self.action = 1
        self.shield = 1 if 'W' in abilities else 0
        self.lethal = 1 if 'L' in abilities else 0
        self.guard = 1 if 'G' in abilities else 0
        self.charge = 1 if 'C' in abilities else 0
        self.drain = 1 if 'D' in abilities else 0
        self.breakthrough = 1 if 'B'in abilities else 0
        self.live = 1
    def __hash__(self):
         return hash(self.instance_id)
    def __eq__(self, other):
        return (
            self.__class__ == other.__class__ and
            self.instance_id == other.instance_id
        )

class Item(Card):
    def use(self, target):
        pass

class Creature(Card):
    def attackTarget(self, target): # attack op creature
        self.action = 0
        if self.shield: # damage to self
            self.shield = 0
        else:
            self.defense -= target.attack
            if self.defense <=0 or (target.lethal and type(target) is Creature):
                self.live = 0
        if target.shield: # damage to target
            target.shield = 0
        else:
            target.defense -= self.attack
            if target.defense <=0 or (self.lethal and type(target) is Creature):
                target.live = 0

my_player = Player()
op_player = Player()
my_player.setEnemy(op_player)
# op_player.setEnemy(my_player)
while True:
    player_health, player_mana, player_deck, player_rune = [int(j) for j in input().split()]
    my_player.update(player_health, player_mana, player_deck, player_rune)
    player_health, player_mana, player_deck, player_rune = [int(j) for j in input().split()]
    op_player.update(player_health, player_mana, player_deck, player_rune)

    opponent_hand = int(input())
    card_count = int(input())
    draft_list = []
    for i in range(card_count):
        card_number, instance_id, location, card_type, cost, attack, defense, abilities, my_health_change, opponent_health_change, card_draw = map(lambda x: int(x) if x[-1].isdigit() else x,input().split())
        if card_type!=0:
            card = Item(card_number, instance_id, location, card_type, cost, attack, defense, abilities, my_health_change, opponent_health_change, card_draw)
        else:
            card = Creature(card_number, instance_id, location, card_type, cost, attack, defense, abilities, my_health_change, opponent_health_change, card_draw)
        if my_player.player_mana==0:
            draft_list.append(card)
        elif location==0:
            my_player.addHand(card)
        elif location==1:
            my_player.addBoard(card)
        elif location==-1:
            op_player.addBoard(card)

    if my_player.player_mana==0:
        my_player.draft(draft_list)
    else:
        my_player.play()
```

การเขียนอาจะจะเข้าใจยากไปหน่อย สามารถติชมกันได้ครับ
