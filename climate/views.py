from django.shortcuts import render

from django.http import HttpResponse

from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
import urllib2


@login_required
def index(request):
    return render(request, 'climate/climate.html')

@login_required
@csrf_exempt
def transfer(request, url): #based on http://stackoverflow.com/questions/5226173/django-as-reverse-proxy
    print "********* transfer request ***********"
    transfer_base = "http://137.248.191.219:8080/"
    transfer_sub = request.path[len("/climate/transfer/"):]
    if request.method == "GET": 
       transfer_parameters = request.GET.urlencode()
    else:
       transfer_parameters = ""
    transfer_target = transfer_base + transfer_sub + "?" + transfer_parameters
    print "transfer target "+transfer_target
    digest_url = "http://137.248.191.219:8080"
    digest_broker_account = "geonode_bale"
    digest_password = "9BMXF7hv"
    digest_realm = "Web Server Login"
    pwd_mgr = urllib2.HTTPPasswordMgr()
    pwd_mgr.add_password(digest_realm, digest_url, digest_broker_account, digest_password)
    opener = urllib2.build_opener()
    opener.add_handler(urllib2.HTTPDigestAuthHandler(pwd_mgr))
    urllib2.install_opener(opener)
    if request.method == "POST":
        data = request.body
    else:
        data = None
    request_headers = {}
    request_headers['Cookie'] = "; ".join('%s=%s' % (k,v) for k,v in request.COOKIES.iteritems())
    print(request_headers)
    transfer_request = urllib2.Request(transfer_target, data, request_headers)
    
    sock = urllib2.urlopen(transfer_request)
    cookies = sock.info().getheader('Set-Cookie')
    print sock.info()
    contentType = sock.info().getheader('Content-Type')
    print "contentType"
    print contentType
    content = sock.read()
    sock.close()
    response = HttpResponse(content, content_type=contentType)
    if cookies:
       print "------------------------------------------------------ cookies!" 
       for cookie in cookies.split(";"):
          pair = cookie.split("=")
          if pair[0] != "Path": 
             response.set_cookie(pair[0], pair[1])
             print(pair[0])
             print(pair[1])
             
       print "------------------------------------------------------" 
    return response
    
    #transfer_content = urllib2.urlopen(transfer_request)
    #return HttpResponse(transfer_content)
    #return HttpResponse(request.path[len("/climate/transfer/"):]+"  "+request.path)
    #return HttpResponse("::" + request.GET.urlencode())
