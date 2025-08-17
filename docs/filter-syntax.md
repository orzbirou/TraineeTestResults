Filter Syntax (Data page)
Supported (case-insensitive):

ID:<value> / i:<value> – traineeId contains value

NAME:<value> / n:<value> – traineeName contains value

SUBJECT:<value> / s:<value> – subject contains value

GRADE:>X | GRADE:<X | GRADE:X-Y – numeric filters

DATE:>YYYY-MM-DD | DATE:<YYYY-MM-DD | DATE:A..B (or A-B) – date ranges

Plain terms (no prefix) search in id/name/subject.

Examples:
```vbnet
ID:T001 GRADE:>80 DATE:2025-03-01..2025-06-30
n:alice s:math grade:70-90
physics
```
