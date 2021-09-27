
level where requested are ANDed

NodeAffinity - preferred different API to pod affinity

order is important - if you create deployment first then scheduling will happen when you apply labels, might not get expected results

preferences mean the scheduler can make a judgement, so you may not be able to get the exact results (5-1)