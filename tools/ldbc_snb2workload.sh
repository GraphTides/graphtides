#!/bin/sh
echo -n > stream.csv

# id|firstName|lastName|gender|birthday|creationDate|locationIP|browserUsed
tail -n +2 person_0_0.csv | sed -E 's/([0-9]+)\|([^\|]*)\|([^\|]*)\|([^\|]*)\|([^\|]*)\|([^\|]*)\|([^\|]*)\|([^\|]*)/\6,CREATE_VERTEX,\1,{"firstName": "\2", "lastName": "\3", "gender": "\4", "birthday": "\5", "locationIP": "\7", "browserUsed": "\8"}/' >> stream.csv

# id|creationDate|locationIP|browserUsed|content|length
# tail -n +2 comment_0_0.csv | sed -E 's/([0-9]+)\|([^\|]*)\|([^\|]*)\|([^\|]*)\|([^\|]*)\|([0-9]*)/\2,CREATE_VERTEX,\1,{"locationIP": "\3", "browserUsed": "\4", "content": "\5", "length": "\6"}/' >> stream.csv

# id|imageFile|creationDate|locationIP|browserUsed|language|content|length
# tail -n +2 post_0_0.csv | sed -E 's/([0-9]+)\|([^\|]*)\|([^\|]*)\|([^\|]*)\|([^\|]*)\|([^\|]*)\|([^\|]*)\|([0-9]*)/\3,CREATE_VERTEX,\1,{"imageFile": "\2", "locationIP": "\4", "browserUsed": "\5", "language": "\6", "content": "\7", "length": "\8"}/' >> stream.csv

# Person.id|Person.id|creationDate
tail -n +2 person_knows_person_0_0.csv | sed -E 's/([0-9]+)\|([0-9]+)\|(.*)/\3,CREATE_EDGE,\1-\2,{}/' >> stream.csv

# Person.id|Comment.id|creationDate
# tail -n +2 person_likes_comment_0_0.csv | sed -E 's/([0-9]+)\|([0-9]+)\|(.*)/\3,CREATE_EDGE,\1-\2,{}/' >> stream.csv

# Person.id|Post.id|creationDate
# tail -n +2 person_likes_post_0_0.csv | sed -E 's/([0-9]+)\|([0-9]+)\|(.*)/\3,CREATE_EDGE,\1-\2,{}/' >> stream.csv

# sort event stream
sort -t "," -k1 -o stream.csv stream.csv
