from datetime import time
from zoneinfo import ZoneInfo

LONDON = ZoneInfo("Europe/London")
DEFAULT_CUTOFF = time(9, 20)  # EPEX hourly day-ahead gate closure, UK local time